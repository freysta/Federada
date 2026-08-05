import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Logger,
  BadRequestException,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMyOrders(@Req() req: any) {
    return this.ordersService.findMyOrders(req.user.userId);
  }

  @Post('webhook')
  handleWebhook(@Body() data: any, @Req() req: any) {
    const logger = new Logger('WebhookController');
    logger.log(
      `Webhook received: type=${data?.type}, data.id=${data?.data?.id}`,
    );

    const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    const signature = req.headers['x-signature'];
    const requestId = req.headers['x-request-id'];

    if (secret && signature && requestId) {
      const parts = signature.split(',');
      let ts = '';
      let v1 = '';
      parts.forEach((part: string) => {
        const [key, value] = part.split('=');
        if (key.trim() === 'ts') ts = value;
        if (key.trim() === 'v1') v1 = value;
      });
      const manifest = `id:${data?.data?.id};request-id:${requestId};ts:${ts};`;
      const crypto = require('crypto');
      const hmac = crypto
        .createHmac('sha256', secret)
        .update(manifest)
        .digest('hex');
      if (hmac !== v1) {
        logger.error(`Invalid webhook signature! Expected ${v1}, got ${hmac}`);
        throw new UnauthorizedException('Invalid webhook signature');
      }
    } else if (!secret) {
      logger.warn(
        'MERCADO_PAGO_WEBHOOK_SECRET is not set. Signature validation skipped. Verify payment status directly with MP.',
      );
    }

    if (!data || data.type !== 'payment' || !data.data?.id) {
      logger.warn(
        `Invalid webhook payload rejected: ${JSON.stringify(data).substring(0, 200)}`,
      );
      return { received: true, processed: false, reason: 'Invalid payload' };
    }

    return this.ordersService.handleWebhook(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STORE_ADMIN')
  @Get('dashboard')
  getDashboardStats() {
    return this.ordersService.getDashboardStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STORE_ADMIN')
  @Get()
  findAll(@Query('page') page: string, @Query('limit') limit: string) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 10;
    return this.ordersService.findAll(p, l);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const order = await this.ordersService.findOne(id);
    if (!order) return null;
    const userRole = req.user.role;
    const isAdmin = userRole === 'ADMIN' || userRole === 'STORE_ADMIN';
    if (!isAdmin && order.user.id !== req.user.userId) {
      throw new UnauthorizedException('Unauthorized access to this order');
    }
    return order;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STORE_ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STORE_ADMIN')
  @Post(':id/refund')
  refund(@Param('id') id: string) {
    return this.ordersService.refund(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STORE_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
