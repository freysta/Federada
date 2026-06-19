import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
}

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  @IsEnum(OrderStatus)
  status?: string;

  @IsOptional()
  @IsString()
  trackingCode?: string;
}
