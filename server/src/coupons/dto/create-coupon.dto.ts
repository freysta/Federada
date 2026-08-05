export class CreateCouponDto {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxUses?: number;
  expiresAt?: Date;
  isActive?: boolean;
}
