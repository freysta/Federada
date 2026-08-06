import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { Championship } from './championship.entity';

@Entity()
@Unique(['team', 'championship']) // A team can only enroll once per championship
export class TeamChampionshipEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  team: Team;

  @ManyToOne(() => Championship, { onDelete: 'CASCADE' })
  championship: Championship;

  @CreateDateColumn()
  createdAt: Date;
}
