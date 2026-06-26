import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Championship } from './championship.entity';
import { AthleteProfile } from '../../teams/entities/athlete-profile.entity';

@Entity()
export class ChampionshipDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AthleteProfile, { onDelete: 'CASCADE' })
  athlete: AthleteProfile;

  @ManyToOne(() => Championship, { onDelete: 'CASCADE' })
  championship: Championship;

  @Column()
  documentName: string;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, APPROVED, REJECTED

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
