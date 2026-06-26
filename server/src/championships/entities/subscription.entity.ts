import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Modality } from './modality.entity';
import { AthleteProfile } from '../../teams/entities/athlete-profile.entity';
import { Team } from '../../teams/entities/team.entity';

export enum SubscriptionStatus {
  PENDING_ROSTER = 'PENDING_ROSTER',
  PENDING_DOCS = 'PENDING_DOCS',
  DOCS_APPROVED = 'DOCS_APPROVED',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED'
}

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Modality, modality => modality.subscriptions, { onDelete: 'CASCADE' })
  modality: Modality;

  // Inscrição individual
  @ManyToOne(() => AthleteProfile, { onDelete: 'CASCADE', nullable: true })
  athlete: AthleteProfile;

  // Inscrição coletiva (Opcional, atrelado a uma atlética inteira se for esporte coletivo)
  @ManyToOne(() => Team, { onDelete: 'CASCADE', nullable: true })
  team: Team;

  // Elenco da equipe nesta modalidade
  @ManyToMany(() => AthleteProfile)
  @JoinTable({ name: 'subscription_roster' })
  athletes: AthleteProfile[];

  @Column({ type: 'varchar', default: SubscriptionStatus.PENDING_DOCS })
  status: SubscriptionStatus;

  @Column({ default: 'PENDING' })
  paymentStatus: string; // PENDING, PAID, FREE

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
