import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Modality } from './modality.entity';
import { Team } from '../../teams/entities/team.entity';
import { AthleteProfile } from '../../teams/entities/athlete-profile.entity';

@Entity()
@Index(['status', 'round'])
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Modality, (modality) => modality.matches, {
    onDelete: 'CASCADE',
  })
  modality: Modality;

  @ManyToOne(() => Team, { nullable: true })
  teamA: Team;

  @ManyToOne(() => Team, { nullable: true })
  teamB: Team;

  @ManyToOne(() => AthleteProfile, { nullable: true })
  athleteA: AthleteProfile;

  @ManyToOne(() => AthleteProfile, { nullable: true })
  athleteB: AthleteProfile;

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
  group: string; // Grupo A, Grupo B, etc.

  @Column({ nullable: true })
  bracketPosition: number; // Posição na chave mata-mata (ex: 1 para o primeiro jogo, 2 para o segundo...)

  @ManyToOne(() => Match, { nullable: true })
  nextMatch: Match; // Próximo jogo na chave mata-mata

  @Column({ nullable: true })
  summaryFileUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
