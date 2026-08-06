import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../orders/entities/user.entity';
import { Team } from './team.entity';

@Entity()
export class AthleteProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Team, (team) => team.athletes, {
    onDelete: 'SET NULL',
    nullable: true,
  })
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

  @Column({ unique: true, nullable: true })
  athleteIdCode: string;

  @Column({ default: 'ATHLETE' })
  teamRole: string; // PRESIDENT, MEMBER, ATHLETE

  @Column({ default: 'PENDING' })
  teamJoinStatus: string; // PENDING, APPROVED, REJECTED

  @Column({ default: 'PENDING' })
  status: string; // PENDING, APPROVED, REJECTED (for Documents)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
