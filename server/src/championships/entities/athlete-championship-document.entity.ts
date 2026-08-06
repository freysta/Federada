import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { AthleteProfile } from '../../teams/entities/athlete-profile.entity';
import { Championship } from './championship.entity';

@Entity()
@Unique(['athlete', 'championship'])
export class AthleteChampionshipDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AthleteProfile, { onDelete: 'CASCADE' })
  athlete: AthleteProfile;

  @ManyToOne(() => Championship, { onDelete: 'CASCADE' })
  championship: Championship;

  @Column({ nullable: true })
  rgUrl: string;

  @Column({ default: 'PENDING' })
  rgStatus: string; // PENDING, APPROVED, REJECTED

  @Column({ type: 'text', nullable: true })
  rgRejectionReason: string | null;

  @Column({ nullable: true })
  enrollmentUrl: string;

  @Column({ default: 'PENDING' })
  enrollmentStatus: string; // PENDING, APPROVED, REJECTED

  @Column({ type: 'text', nullable: true })
  enrollmentRejectionReason: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
