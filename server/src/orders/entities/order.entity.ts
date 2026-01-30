import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productName: string;

  @Column({ nullable: true })
  productSize: string;

  @Column('decimal')
  amount: number;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ nullable: true })
  paymentId: string | null;

  @Column({ nullable: true })
  pixCopyPaste: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;
}