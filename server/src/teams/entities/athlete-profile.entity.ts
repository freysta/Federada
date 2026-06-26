import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../orders/entities/user.entity';
import { Team } from './team.entity';

@Entity()
export class AthleteProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Team, team => team.athletes, { onDelete: 'SET NULL', nullable: true })
  team: Team;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  cpf: string;

  @Column({ nullable: true })
  gender: string; // MASCULINO, FEMININO

  @Column({ nullable: true })
  course: string;

  @Column({ nullable: true })
  period: string;

  @Column({ nullable: true })
  documentRgUrl: string;

  @Column({ default: 'PENDING' })
  documentRgStatus: string; // PENDING, APPROVED, REJECTED

  @Column({ type: 'text', nullable: true })
  documentRgRejectionReason: string | null;

  @Column({ nullable: true })
  documentEnrollmentUrl: string;

  @Column({ default: 'PENDING' })
  documentEnrollmentStatus: string; // PENDING, APPROVED, REJECTED

  @Column({ type: 'text', nullable: true })
  documentEnrollmentRejectionReason: string | null;

  @Column({ unique: true, nullable: true })
  athleteIdCode: string;

  @Column({ default: 'ATHLETE' })
  teamRole: string; // PRESIDENT, MEMBER, ATHLETE

  @Column({ default: 'PENDING' })
  status: string; // PENDING, APPROVED, REJECTED

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
