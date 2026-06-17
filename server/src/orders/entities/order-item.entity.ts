import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @Column()
  productName: string;

  @Column({ nullable: true })
  productSize: string;

  @Column({ nullable: true })
  customName: string;

  @Column({ nullable: true })
  customNumber: string;

  @Column({ nullable: true })
  playerType: string;

  @Column('decimal')
  price: number;

  @Column('int', { default: 1 })
  quantity: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;
}
