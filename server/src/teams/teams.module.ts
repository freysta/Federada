import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { AthleteProfile } from './entities/athlete-profile.entity';
import { AthleteAvailability } from './entities/athlete-availability.entity';
import { StorageModule } from '../storage/storage.module';

import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, AthleteProfile, AthleteAvailability]),
    StorageModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TypeOrmModule, TeamsService],
})
export class TeamsModule {}
