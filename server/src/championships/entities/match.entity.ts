import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Modality } from './modality.entity';
import { Team } from '../../teams/entities/team.entity';

@Entity()
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Modality, modality => modality.matches, { onDelete: 'CASCADE' })
  modality: Modality;

  @ManyToOne(() => Team, { nullable: true })
  teamA: Team;

  @ManyToOne(() => Team, { nullable: true })
  teamB: Team;

  @Column({ nullable: true })
  date: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  scoreA: number;

  @Column({ nullable: true })
  scoreB: number;

  @Column({ default: 'SCHEDULED' })
  status: string; // SCHEDULED, IN_PROGRESS, FINISHED

  @Column({ nullable: true })
  phase: string; // GROUP, KNOCKOUT, FINAL

  @Column({ nullable: true })
  round: number;

  @Column({ nullable: true })
  summaryFileUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
