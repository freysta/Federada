import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @Column('decimal')
  amount: number;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ type: 'text', nullable: true })
  paymentId: string | null;

  @Column({ type: 'text', nullable: true })
  pixCopyPaste: string | null;

  @Column({ type: 'text', nullable: true })
  trackingCode: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  user: User;
}