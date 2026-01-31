import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { User } from './entities/user.entity';
import { MercadoPagoConfig, Payment } from 'mercadopago';

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
  ) {
    this.initializeMP();
  }

  private async initializeMP() {
    this.accessToken = this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN');
    
    if (!this.accessToken) {
      console.error('CRITICAL: MERCADO_PAGO_ACCESS_TOKEN not defined');
      return;
    }

    this.mpClient = new MercadoPagoConfig({
      accessToken: this.accessToken,
    });
  }

  async create(createOrderDto: CreateOrderDto) {
    if (!this.mpClient) await this.initializeMP();
    
    const {
      customerName,
      customerEmail,
      customerCpf,
      customerPhone,
      productName,
      productSize,
      amount,
    } = createOrderDto;

    // 1. Find or Create User
    let user = await this.usersRepository.findOne({
      where: [
        { email: customerEmail },
        { cpf: customerCpf }
      ],
    });

    if (!user) {
      user = this.usersRepository.create({
        email: customerEmail,
        cpf: customerCpf,
        name: customerName,
        phone: customerPhone,
      });
      await this.usersRepository.save(user);
    }

    // 2. Create Order (Initial)
    const order = this.ordersRepository.create({
      user: user,
      productName: productName,
      productSize: productSize,
      amount: amount,
      status: 'PENDING',
    });

    await this.ordersRepository.save(order);

    // 3. Generate Mercado Pago Payment
    try {
      const payment = new Payment(this.mpClient);
      
      const body = {
        transaction_amount: amount,
        description: `${productName}${productSize ? ` - ${productSize}` : ''}`,
        payment_method_id: 'pix',
        payer: {
          email: customerEmail,
          first_name: customerName.split(' ')[0],
          last_name: customerName.split(' ').slice(1).join(' ') || 'Customer',
          identification: {
            type: 'CPF',
            number: customerCpf.replace(/\D/g, ''),
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

  async handleWebhook(data: any) {
    if (data.type === 'payment') {
      const paymentId = data.data.id;
      const payment = new Payment(this.mpClient);
      
      try {
        const paymentData = await payment.get({ id: paymentId });
        
        const order = await this.ordersRepository.findOne({
          where: { paymentId: paymentId.toString() },
        });

        if (order) {
          if (paymentData.status === 'approved') {
            order.status = 'PAID';
          } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
            order.status = 'CANCELLED';
          }
          await this.ordersRepository.save(order);
        }
      } catch (error) {
        console.error('Webhook processing error:', error);
      }
    }
    return { received: true };
  }

  findAll() {
    return this.ordersRepository.find({ relations: ['user'] });
  }

  findOne(id: string) {
    return this.ordersRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    await this.ordersRepository.update(id, updateOrderDto);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.ordersRepository.delete(id);
  }
}
