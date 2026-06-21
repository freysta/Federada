import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { User } from '../../orders/entities/user.entity';
import { AthleteProfile } from './athlete-profile.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  university: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ unique: true })
  inviteCode: string; // Ex: FEDERADA-2026

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  owner: User;

  @OneToMany(() => AthleteProfile, profile => profile.team)
  athletes: AthleteProfile[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
