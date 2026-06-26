import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Modality } from './modality.entity';

@Entity()
export class Championship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ default: 'OPEN' })
  status: string; // OPEN, CLOSED, IN_PROGRESS, FINISHED

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
