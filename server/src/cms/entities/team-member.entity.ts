import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  instagramUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
