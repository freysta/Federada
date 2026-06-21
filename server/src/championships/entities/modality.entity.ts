import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Championship } from './championship.entity';
import { Subscription } from './subscription.entity';

@Entity()
export class Modality {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // Ex: Futsal Masculino

  @Column({ default: 'INDIVIDUAL' })
  type: string; // INDIVIDUAL, COLETIVO

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number; // Preço da inscrição (0 para gratuito)

  @ManyToOne(() => Championship, champ => champ.modalities, { onDelete: 'CASCADE' })
  championship: Championship;

  @OneToMany(() => Subscription, sub => sub.modality)
  subscriptions: Subscription[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
