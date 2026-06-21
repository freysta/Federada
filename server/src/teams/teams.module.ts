import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { AthleteProfile } from './entities/athlete-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team, AthleteProfile])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class TeamsModule {}
