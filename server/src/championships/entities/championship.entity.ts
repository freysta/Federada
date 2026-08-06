import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
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
  ARCHIVED = 'ARCHIVED',
}

export enum AudienceFocus {
  GENERAL = 'GENERAL',
  UNIVERSITY = 'UNIVERSITY',
  SCHOOL = 'SCHOOL',
  CITY = 'CITY',
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

  @Column({ type: 'varchar', nullable: true })
  organizer: string;

  @Column({ type: 'varchar', default: AudienceFocus.GENERAL })
  audienceFocus: AudienceFocus;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  registrationOpenedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  registrationClosedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  finishedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  archivedAt: Date | null;

  @OneToMany(() => Modality, (modality) => modality.championship)
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

  @DeleteDateColumn()
  deletedAt: Date;
}
