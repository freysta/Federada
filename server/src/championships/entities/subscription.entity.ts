import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Modality } from './modality.entity';
import { AthleteProfile } from '../../teams/entities/athlete-profile.entity';
import { Team } from '../../teams/entities/team.entity';

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

  @Column({ default: 'PENDING' })
  status: string; // PENDING, APPROVED, REJECTED

  @Column({ default: 'PENDING' })
  paymentStatus: string; // PENDING, PAID, FREE

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
