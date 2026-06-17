import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from './entities/user.entity';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  private mpClient: MercadoPagoConfig;
  private accessToken: string;

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
    private productsService: ProductsService,
  ) {
    this.initializeMP();
  }

  private async initializeMP() {
    this.accessToken = this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN') || '';
    
    if (!this.accessToken) {
      console.error('CRITICAL: MERCADO_PAGO_ACCESS_TOKEN not defined');
      return;
    }

    this.mpClient = new MercadoPagoConfig({
      accessToken: this.accessToken,
    });
  }

  async create(userId: string, createOrderDto: CreateOrderDto) {
    if (!this.mpClient) await this.initializeMP();
    
    // 1. Find User
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new InternalServerErrorException('User not found');

    // 2. Validate Items & Calculate Total
    let totalAmount = 0;
    const orderItemsToCreate: Partial<OrderItem>[] = [];

    for (const itemDto of createOrderDto.items) {
      const product = await this.productsService.findOne(itemDto.productId);
      if (!product) throw new InternalServerErrorException(`Product ${itemDto.productId} not found`);

      totalAmount += Number(product.price) * itemDto.quantity;

      orderItemsToCreate.push({
        productId: product.id,
        productName: product.name,
        productSize: itemDto.size || undefined,
        customName: itemDto.customName || undefined,
        customNumber: itemDto.customNumber || undefined,
        playerType: itemDto.playerType || undefined,
        price: Number(product.price),
        quantity: itemDto.quantity,
      });
    }

    // 3. Create Order
    const order = this.ordersRepository.create({
      user: user,
      amount: totalAmount,
      status: 'PENDING',
      items: orderItemsToCreate,
    });

    await this.ordersRepository.save(order);

    // 4. Generate Mercado Pago Payment
    try {
      const payment = new Payment(this.mpClient);
      
      const webhookUrl = this.configService.get<string>('WEBHOOK_URL');
      const itemsDescription = orderItemsToCreate.map(i => `${i.quantity}x ${i.productName}`).join(', ');

      const body = {
        transaction_amount: Number(totalAmount),
        description: itemsDescription.substring(0, 255),
        payment_method_id: 'pix',
        external_reference: order.id,
        notification_url: webhookUrl ? `${webhookUrl}/orders/webhook` : undefined,
        payer: {
          email: user.email,
          first_name: user.name.split(' ')[0],
          last_name: user.name.split(' ').slice(1).join(' ') || 'Customer',
          identification: {
            type: 'CPF',
            number: user.cpf.replace(/\D/g, ''),
          },
        },
      };

      const paymentResponse = await payment.create({ body });

      const pointOfInteraction = paymentResponse.point_of_interaction;
      const pixCopyPaste = pointOfInteraction?.transaction_data?.qr_code;
      const qrCodeBase64 = pointOfInteraction?.transaction_data?.qr_code_base64;

      order.paymentId = paymentResponse.id?.toString() ?? null;
      order.pixCopyPaste = pixCopyPaste ?? null;
      await this.ordersRepository.save(order);

      return {
        orderId: order.id,
        customer: user.name,
        paymentId: order.paymentId,
        pix: {
          copyPaste: pixCopyPaste,
          qrCodeBase64: qrCodeBase64,
        },
      };
    } catch (error) {
      console.error('Mercado Pago Error:', error);
      throw new InternalServerErrorException('Error generating payment with Mercado Pago');
    }
  }

  findMyOrders(userId: string) {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      relations: ['items'],
      order: { createdAt: 'DESC' }
    });
  }

  async handleWebhook(data: any) {
    console.log('Webhook received:', JSON.stringify(data));

    if (data.type === 'payment') {
      if (!this.mpClient) {
        console.warn('Mercado Pago Client not initialized. Check MERCADO_PAGO_ACCESS_TOKEN.');
        return { received: true }; // Return 200/201 to stop MP from retrying
      }

      const paymentId = data.data.id;
      
      try {
        const payment = new Payment(this.mpClient);
        const paymentData = await payment.get({ id: paymentId });
        console.log(`Payment ${paymentId} status: ${paymentData.status}`);
        
        const order = await this.ordersRepository.findOne({
          where: { paymentId: paymentId.toString() },
        });

        if (order) {
          if (paymentData.status === 'approved') {
            order.status = 'PAID';
            console.log(`Order ${order.id} marked as PAID`);
          } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
            order.status = 'CANCELLED';
            console.log(`Order ${order.id} marked as CANCELLED`);
          }
          await this.ordersRepository.save(order);
        } else {
          console.warn(`No order found for paymentId: ${paymentId}`);
        }
      } catch (error) {
        // Ignora erro 404 (comum em testes com ID falso como 123456)
        if (error.status === 404 || error.cause?.code === 404) {
             console.warn(`Payment ${paymentId} not found (Test notification?).`);
        } else {
             console.error('Webhook processing error:', error);
        }
      }
    }
    return { received: true };
  }

  async getDashboardStats() {
    const orders = await this.ordersRepository.find({ relations: ['items'] });
    
    let totalRevenue = 0;
    let totalItemsSold = 0;
    let pendingCount = 0;
    let paidCount = 0;
    let cancelledCount = 0;

    for (const order of orders) {
      if (order.status === 'PAID') {
        totalRevenue += Number(order.amount);
        totalItemsSold += order.items.reduce((acc, item) => acc + item.quantity, 0);
        paidCount++;
      } else if (order.status === 'PENDING') {
        pendingCount++;
      } else if (order.status === 'CANCELLED') {
        cancelledCount++;
      }
    }

    return {
      totalRevenue,
      totalItemsSold,
      ordersCount: orders.length,
      paidCount,
      pendingCount,
      cancelledCount,
      recentOrders: orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5)
    };
  }

  findAll() {
    return this.ordersRepository.find({ relations: ['user', 'items'], order: { createdAt: 'DESC' } });
  }

  findOne(id: string) {
    return this.ordersRepository.findOne({
      where: { id },
      relations: ['user', 'items'],
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    await this.ordersRepository.update(id, updateOrderDto as any);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.ordersRepository.delete(id);
  }
}
