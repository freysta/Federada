import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponsRepository: Repository<Coupon>,
  ) {}

  async create(createCouponDto: CreateCouponDto) {
    const existing = await this.couponsRepository.findOne({
      where: { code: createCouponDto.code.toUpperCase() },
    });
    if (existing) {
      throw new BadRequestException('Um cupom com este código já existe.');
    }

    const coupon = this.couponsRepository.create({
      ...createCouponDto,
      code: createCouponDto.code.toUpperCase(),
    });
    return this.couponsRepository.save(coupon);
  }

  findAll() {
    return this.couponsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const coupon = await this.couponsRepository.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Cupom não encontrado');
    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    if (updateCouponDto.code) {
      updateCouponDto.code = updateCouponDto.code.toUpperCase();
      const existing = await this.couponsRepository.findOne({
        where: { code: updateCouponDto.code },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException('Um cupom com este código já existe.');
      }
    }

    await this.couponsRepository.update(id, updateCouponDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const coupon = await this.findOne(id);
    await this.couponsRepository.remove(coupon);
    return { message: 'Cupom removido com sucesso' };
  }

  async validate(code: string) {
    const coupon = await this.couponsRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new BadRequestException('Cupom inválido ou não encontrado.');
    }

    if (!coupon.isActive) {
      throw new BadRequestException('Este cupom está inativo.');
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new BadRequestException('Este cupom já expirou.');
    }

    if (coupon.maxUses !== null && coupon.usesCount >= coupon.maxUses) {
      throw new BadRequestException('Este cupom atingiu o limite de usos.');
    }

    return {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    };
  }

  async incrementUses(id: string) {
    await this.couponsRepository.increment({ id }, 'usesCount', 1);
  }
}
