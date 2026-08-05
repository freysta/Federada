import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from './entities/user.entity';
import {
  MercadoPagoConfig,
  Payment,
  Preference,
  PaymentRefund,
} from 'mercadopago';
import { ProductsService } from '../products/products.service';
import { MailerService } from '@nestjs-modules/mailer';
import { CouponsService } from '../coupons/coupons.service';
import { Coupon } from '../coupons/entities/coupon.entity';
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
    private couponsService: CouponsService,
  ) {
    this.initializeMP();
  }

  private initializeMP() {
    this.accessToken =
      this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN') || '';

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

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new InternalServerErrorException('User not found');

    let totalAmount = 0;
    const orderItemsToCreate: Partial<OrderItem>[] = [];

    const productIds = createOrderDto.items.map((item) => item.productId);
    const products = await this.productsService.findByIds(productIds);
    const productsMap = new Map(products.map((p) => [p.id, p]));

    for (const itemDto of createOrderDto.items) {
      const product = productsMap.get(itemDto.productId);
      if (!product)
        throw new InternalServerErrorException(
          `Product ${itemDto.productId} not found`,
        );

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

    let discountAmount = 0;
    let appliedCouponCode = null;
    let couponDetails = null;

    if (createOrderDto.couponCode) {
      couponDetails = await this.couponsService.validate(
        createOrderDto.couponCode,
      );
      appliedCouponCode = couponDetails.code;
      if (couponDetails.discountType === 'PERCENTAGE') {
        discountAmount = totalAmount * (couponDetails.discountValue / 100);
      } else {
        discountAmount = Number(couponDetails.discountValue);
      }
      if (discountAmount > totalAmount) discountAmount = totalAmount;
    }

    const finalTotalAmount = totalAmount - discountAmount;

    try {
      const { order, prefResponse } =
        await this.ordersRepository.manager.transaction(async (manager) => {
          let orderEntity = manager.create(Order, {
            user: user,
            amount: finalTotalAmount,
            couponCode: appliedCouponCode,
            discountAmount: discountAmount > 0 ? discountAmount : null,
            status: 'PENDING',
            items: orderItemsToCreate,
          });

          orderEntity = await manager.save(orderEntity);

          if (couponDetails) {
            await manager.increment(
              Coupon,
              { id: couponDetails.id },
              'usesCount',
              1,
            );
          }

          const preference = new Preference(this.mpClient);
          const webhookUrl = this.configService.get<string>('WEBHOOK_URL');

          let mpItems = orderItemsToCreate.map((i) => ({
            id: i.productId!.toString(),
            title: i.productName || 'Produto',
            quantity: i.quantity || 1,
            unit_price: Number(i.price) || 0,
            currency_id: 'BRL',
          }));

          if (discountAmount > 0) {
            const discountFactor = finalTotalAmount / totalAmount;
            mpItems = mpItems.map((i) => ({
              ...i,
              unit_price: Number((i.unit_price * discountFactor).toFixed(2)),
            }));
          }

          const body = {
            items: mpItems,
            payer: {
              name: user.name,
              email: user.email,
              ...(user.cpf
                ? { identification: { type: 'CPF', number: user.cpf } }
                : {}),
            },
            payment_methods: {
              excluded_payment_methods: [],
              excluded_payment_types: [],
            },
            back_urls: {
              success: 'http://localhost:5174/orders',
              pending: 'http://localhost:5174/orders',
              failure: 'http://localhost:5174/',
            },
            external_reference: orderEntity.id,
            notification_url: webhookUrl
              ? `${webhookUrl}/orders/webhook`
              : undefined,
          };

          const prefResponseResult = await preference.create({ body });

          orderEntity.paymentId = prefResponseResult.id || null;
          await manager.save(orderEntity);

          return { order: orderEntity, prefResponse: prefResponseResult };
        });

      const storeUrl =
        this.configService.get('STORE_URL') || 'https://federada.com.br';
      this.mailerService
        .sendMail({
          to: user.email,
          subject: `Seu pedido foi recebido! #${order.id.slice(0, 8)}`,
          html: `
        <div style="font-family: monospace; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; overflow: hidden;">
          <div style="background-color: #000; padding: 30px; text-align: center;">
            <img src="${storeUrl}/urso-polar-andando.gif" alt="Urso" style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%; border: 2px solid white; margin-bottom: 10px;" />
            <h1 style="color: #fff; letter-spacing: 4px; margin: 0; font-size: 24px; text-transform: uppercase;">FEDERADA</h1>
          </div>
          <div style="padding: 40px 30px; background-color: #fff; color: #000;">
            <h2 style="margin-top: 0;">Olá, ${user.name}</h2>
            <p>Recebemos o seu pedido <strong>#${order.id.slice(0, 8)}</strong> no valor de <strong>R$ ${Number(order.amount).toFixed(2).replace('.', ',')}</strong> e ele está aguardando pagamento.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${prefResponse.init_point}" style="background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; display: inline-block;">Realizar Pagamento</a>
            </div>
            <p>Após a confirmação do pagamento, você receberá um novo e-mail.</p>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; color: #888; font-size: 10px; letter-spacing: 1px;">
            © 2026 FEDERADA. TODOS OS DIREITOS RESERVADOS.
          </div>
        </div>
        `,
        })
        .catch((e) => console.error('Erro ao enviar email de pedido:', e));

      return {
        orderId: order.id,
        customer: user.name,
        paymentId: prefResponse.id,
        initPoint: prefResponse.init_point,
      };
    } catch (error) {
      console.error('Mercado Pago Error or Transaction failed:', error);
      throw new InternalServerErrorException(
        'Error generating Checkout Pro Preference',
      );
    }
  }

  findMyOrders(userId: string) {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async handleWebhook(data: any) {
    console.log('Webhook received:', JSON.stringify(data));

    if (data.type === 'payment') {
      if (!this.mpClient) {
        console.warn(
          'Mercado Pago Client not initialized. Check MERCADO_PAGO_ACCESS_TOKEN.',
        );
        return { received: true }; // Return 200/201 to stop MP from retrying
      }

      const paymentId = data.data.id;

      try {
        const payment = new Payment(this.mpClient);
        const paymentData = await payment.get({ id: paymentId });
        console.log(`Payment ${paymentId} status: ${paymentData.status}`);

        const order = await this.ordersRepository.findOne({
          where: { id: paymentData.external_reference },
          relations: ['user', 'items'],
        });

        if (order) {
          if (paymentData.status === 'approved') {
            const wasPaid = order.status === 'PAID';
            order.status = 'PAID';
            order.paymentId = paymentId.toString(); // Guarda o ID final do pagamento
            console.log(`Order ${order.id} marked as PAID`);

            if (!wasPaid && order.user?.email) {
              const storeUrl =
                this.configService.get('STORE_URL') ||
                'https://federada.com.br';
              const itemsHtml = order.items
                .map(
                  (i) => `
                <div style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between;">
                  <div>
                    <strong>${i.productName}</strong><br/>
                    <span style="color: #666; font-size: 12px;">Qtd: ${i.quantity} ${i.productSize ? '| Tam: ' + i.productSize : ''}</span>
                  </div>
                  <strong>R$ ${Number(i.price).toFixed(2).replace('.', ',')}</strong>
                </div>
              `,
                )
                .join('');

              this.mailerService
                .sendMail({
                  to: order.user.email,
                  subject: `Pagamento Aprovado! Pedido #${order.id.slice(0, 8)}`,
                  html: `
                <div style="font-family: monospace; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; overflow: hidden;">
                  <div style="background-color: #000; padding: 30px; text-align: center;">
                    <img src="${storeUrl}/urso-polar-andando.gif" alt="Urso" style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%; border: 2px solid white; margin-bottom: 10px;" />
                    <h1 style="color: #fff; letter-spacing: 4px; margin: 0; font-size: 24px; text-transform: uppercase;">FEDERADA</h1>
                  </div>
                  <div style="padding: 40px 30px; background-color: #fff; color: #000;">
                    <h2 style="margin-top: 0; color: #16a34a;">Pagamento Aprovado!</h2>
                    <p>Olá, <strong>${order.user.name}</strong>!</p>
                    <p>O pagamento do seu pedido <strong>#${order.id.slice(0, 8)}</strong> foi confirmado com sucesso.</p>
                    <div style="margin: 30px 0; border: 1px solid #eaeaea; padding: 20px;">
                      <h3 style="margin-top: 0;">Resumo do Pedido</h3>
                      ${itemsHtml}
                      <div style="margin-top: 20px; text-align: right; font-size: 18px;">
                        Total: <strong>R$ ${Number(order.amount).toFixed(2).replace('.', ',')}</strong>
                      </div>
                    </div>
                    <p>Acompanhe o status da entrega acessando a aba "Meus Pedidos" no site.</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${storeUrl}/orders" style="background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; display: inline-block;">Ver Meus Pedidos</a>
                    </div>
                  </div>
                  <div style="background-color: #f9f9f9; padding: 20px; text-align: center; color: #888; font-size: 10px; letter-spacing: 1px;">
                    © 2026 FEDERADA. TODOS OS DIREITOS RESERVADOS.
                  </div>
                </div>
                `,
                })
                .catch((e) =>
                  console.error('Erro ao enviar email de pagamento:', e),
                );
            }
          } else if (
            paymentData.status === 'rejected' ||
            paymentData.status === 'cancelled'
          ) {
            order.status = 'CANCELLED';
            console.log(`Order ${order.id} marked as CANCELLED`);
          }
          await this.ordersRepository.save(order);
        } else {
          console.warn(
            `No order found with external_reference: ${paymentData.external_reference}`,
          );
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
    const rawStats = await this.ordersRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .addSelect('SUM(order.amount)', 'total')
      .groupBy('order.status')
      .getRawMany();

    let totalRevenue = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;
    let ordersCount = 0;

    for (const stat of rawStats) {
      const count = Number(stat.count);
      const total = Number(stat.total);
      ordersCount += count;
      if (stat.status === 'PAID') {
        paidCount = count;
        totalRevenue = total;
      } else if (stat.status === 'PENDING') {
        pendingCount = count;
      } else if (stat.status === 'CANCELLED') {
        cancelledCount = count;
      }
    }

    const rawItemsSold = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoin('order.items', 'items')
      .where('order.status = :status', { status: 'PAID' })
      .select('SUM(items.quantity)', 'total')
      .getRawOne();

    const totalItemsSold = Number(rawItemsSold?.total) || 0;

    const paidOrders = await this.ordersRepository.find({
      where: { status: 'PAID' },
      select: ['createdAt', 'amount'],
    });

    const revenueByDate: Record<string, number> = {};
    for (const order of paidOrders) {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      revenueByDate[dateStr] =
        (revenueByDate[dateStr] || 0) + Number(order.amount);
    }
    const chartData = Object.keys(revenueByDate)
      .sort()
      .map((date) => {
        const d = new Date(date);
        // For timezone consistency when converting back
        d.setUTCHours(12);
        return {
          date: d.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
          }),
          vendas: revenueByDate[date],
        };
      });

    const recentOrders = await this.ordersRepository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      totalRevenue,
      totalItemsSold,
      ordersCount,
      paidCount,
      pendingCount,
      cancelledCount,
      chartData,
      recentOrders,
    };
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.ordersRepository.findAndCount({
      relations: ['user', 'items'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: string) {
    return this.ordersRepository.findOne({
      where: { id },
      relations: ['user', 'items'],
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    await this.ordersRepository.update(id, updateOrderDto);
    return this.findOne(id);
  }

  async refund(id: string) {
    const order = await this.findOne(id);
    if (!order) throw new InternalServerErrorException('Pedido não encontrado');
    if (order.status !== 'PAID')
      throw new BadRequestException(
        'Apenas pedidos pagos podem ser estornados',
      );
    if (!order.paymentId)
      throw new BadRequestException('ID de Pagamento não encontrado');

    if (!this.mpClient) await this.initializeMP();

    try {
      const refundClient = new PaymentRefund(this.mpClient);
      await refundClient.create({ payment_id: order.paymentId, body: {} });

      order.status = 'REFUNDED';
      await this.ordersRepository.save(order);

      if (order.user && order.user.email) {
        const storeUrl =
          this.configService.get('STORE_URL') || 'https://federada.com.br';
        this.mailerService
          .sendMail({
            to: order.user.email,
            subject: `Estorno Realizado! Pedido #${order.id.slice(0, 8)}`,
            html: `
          <div style="font-family: monospace; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; overflow: hidden;">
            <div style="background-color: #000; padding: 30px; text-align: center;">
              <img src="${storeUrl}/urso-polar-andando.gif" alt="Urso" style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%; border: 2px solid white; margin-bottom: 10px;" />
              <h1 style="color: #fff; letter-spacing: 4px; margin: 0; font-size: 24px; text-transform: uppercase;">FEDERADA</h1>
            </div>
            <div style="padding: 40px 30px; background-color: #fff; color: #000;">
              <h2 style="margin-top: 0; color: #dc2626;">Pedido Estornado</h2>
              <p>Olá, <strong>${order.user.name}</strong>!</p>
              <p>O seu pedido <strong>#${order.id.slice(0, 8)}</strong> foi cancelado e o valor de <strong>R$ ${Number(order.amount).toFixed(2).replace('.', ',')}</strong> foi estornado com sucesso.</p>
              <p>O valor retornará para a sua conta ou fatura do cartão de crédito de acordo com os prazos do seu banco.</p>
            </div>
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; color: #888; font-size: 10px; letter-spacing: 1px;">
              © 2026 FEDERADA. TODOS OS DIREITOS RESERVADOS.
            </div>
          </div>
          `,
          })
          .catch((e) => console.error('Erro ao enviar email de estorno:', e));
      }

      return { message: 'Pedido estornado com sucesso', order };
    } catch (error: any) {
      console.error('Error refunding via MP:', error);
      throw new InternalServerErrorException(
        'Erro ao solicitar estorno no Mercado Pago',
      );
    }
  }

  remove(id: string) {
    return this.ordersRepository.delete(id);
  }
}
