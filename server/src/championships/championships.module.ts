import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Championship } from './entities/championship.entity';
import { Modality } from './entities/modality.entity';
import { Subscription } from './entities/subscription.entity';
import { Match } from './entities/match.entity';
import { ChampionshipDocument } from './entities/championship-document.entity';
import { AthleteProfile } from '../teams/entities/athlete-profile.entity';
import { TeamsModule } from '../teams/teams.module';

import { ChampionshipsController } from './championships.controller';
import { ChampionshipsService } from './championships.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Championship, Modality, Subscription, Match, ChampionshipDocument, AthleteProfile]),
    TeamsModule,
  ],
  controllers: [ChampionshipsController],
  providers: [ChampionshipsService],
  exports: [TypeOrmModule, ChampionshipsService],
})
export class ChampionshipsModule {}
