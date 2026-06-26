import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { AthleteProfile } from './athlete-profile.entity';
import { Championship } from '../../championships/entities/championship.entity';

@Entity()
@Unique(['athleteProfile', 'championship']) // O atleta só pode ter 1 registro de disponibilidade por campeonato
export class AthleteAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AthleteProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  athleteProfile: AthleteProfile;

  @ManyToOne(() => Championship, { onDelete: 'CASCADE' })
  @JoinColumn()
  championship: Championship;

  @Column({ default: 'AVAILABLE' })
  status: string; // 'AVAILABLE' | 'UNAVAILABLE'

  @CreateDateColumn()
  createdAt: Date;
}
