import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { Modality } from './modality.entity';
import { User } from '../../orders/entities/user.entity';

export enum ChampionshipStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  GENERATING_BRACKET = 'GENERATING_BRACKET',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
  ARCHIVED = 'ARCHIVED'
}

@Entity()
export class Championship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  owner: User;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'date', nullable: true })
  enrollmentDeadline: Date;

  @Column({ type: 'date', nullable: true })
  documentsDeadline: Date;

  @Column({ type: 'text', nullable: true })
  bannerUrl: string;

  @Column({ type: 'varchar', default: ChampionshipStatus.DRAFT })
  status: ChampionshipStatus;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  registrationOpenedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  registrationClosedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  archivedAt: Date;

  @OneToMany(() => Modality, modality => modality.championship)
  modalities: Modality[];

  @Column({ type: 'simple-json', nullable: true })
  settings: {
    requireRg?: boolean;
    requireEnrollment?: boolean;
    customDocuments?: string[];
    locations?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
