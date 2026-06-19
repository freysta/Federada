import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Logger, BadRequestException } from '@nestjs/common';
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
  handleWebhook(@Body() data: any) {
    const logger = new Logger('WebhookController');
    logger.log(`Webhook received: type=${data?.type}, data.id=${data?.data?.id}`);

    if (!data || data.type !== 'payment' || !data.data?.id) {
      logger.warn(`Invalid webhook payload rejected: ${JSON.stringify(data).substring(0, 200)}`);
      return { received: true, processed: false, reason: 'Invalid payload' };
    }

    return this.ordersService.handleWebhook(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('dashboard')
  getDashboardStats() {
    return this.ordersService.getDashboardStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/refund')
  refund(@Param('id') id: string) {
    return this.ordersService.refund(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
