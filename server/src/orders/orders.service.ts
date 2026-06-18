import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from './entities/user.entity';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { ProductsService } from '../products/products.service';
import { MailerService } from '@nestjs-modules/mailer';

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
    private mailerService: MailerService,
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

    // 4. Generate Mercado Pago Preference (Checkout Pro)
    try {
      const preference = new Preference(this.mpClient);
      
      const webhookUrl = this.configService.get<string>('WEBHOOK_URL');
      
      const items = orderItemsToCreate.map(i => ({
        id: i.productId!.toString(),
        title: i.productName || 'Produto',
        quantity: i.quantity || 1,
        unit_price: Number(i.price) || 0,
        currency_id: 'BRL',
      }));

      const body = {
        items,
        payer: {
          name: user.name,
          email: user.email,
        },
        back_urls: {
          success: 'http://localhost:5174/orders',
          pending: 'http://localhost:5174/orders',
          failure: 'http://localhost:5174/',
        },
        external_reference: order.id,
        notification_url: webhookUrl ? `${webhookUrl}/orders/webhook` : undefined,
      };

      const prefResponse = await preference.create({ body });

      // Salvamos o ID da preferência no paymentId provisoriamente
      order.paymentId = prefResponse.id || null; 
      await this.ordersRepository.save(order);

      this.mailerService.sendMail({
        to: user.email,
        subject: `Seu pedido foi recebido! #${order.id}`,
        text: `Olá ${user.name},\n\nRecebemos o seu pedido de R$ ${Number(order.amount).toFixed(2).replace('.', ',')} e ele está aguardando pagamento.\n\nPara pagar, acesse o link:\n${prefResponse.init_point}\n\nAbraços,\nEquipe Federada`,
      }).catch(e => console.error('Erro ao enviar email de pedido:', e));

      return {
        orderId: order.id,
        customer: user.name,
        paymentId: prefResponse.id,
        initPoint: prefResponse.init_point, // Redirecionamento para o Checkout Pro
      };
    } catch (error) {
      console.error('Mercado Pago Error:', error);
      throw new InternalServerErrorException('Error generating Checkout Pro Preference');
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
          where: { id: paymentData.external_reference },
          relations: ['user']
        });

        if (order) {
          if (paymentData.status === 'approved') {
            const wasPaid = order.status === 'PAID';
            order.status = 'PAID';
            order.paymentId = paymentId.toString(); // Guarda o ID final do pagamento
            console.log(`Order ${order.id} marked as PAID`);

            if (!wasPaid && order.user?.email) {
              this.mailerService.sendMail({
                to: order.user.email,
                subject: `Pagamento Aprovado! Pedido #${order.id}`,
                text: `Olá ${order.user.name},\n\nSeu pagamento de R$ ${Number(order.amount).toFixed(2).replace('.', ',')} foi aprovado com sucesso!\n\nEm breve entraremos em contato sobre a entrega.\n\nAbraços,\nEquipe Federada`,
              }).catch(e => console.error('Erro ao enviar email de pagamento:', e));
            }
          } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
            order.status = 'CANCELLED';
            console.log(`Order ${order.id} marked as CANCELLED`);
          }
          await this.ordersRepository.save(order);
        } else {
          console.warn(`No order found with external_reference: ${paymentData.external_reference}`);
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
