import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Championship } from './entities/championship.entity';
import { Modality } from './entities/modality.entity';
import { Subscription } from './entities/subscription.entity';
import { Match } from './entities/match.entity';
import { ChampionshipDocument } from './entities/championship-document.entity';
import { AthleteProfile } from '../teams/entities/athlete-profile.entity';
import { Team } from '../teams/entities/team.entity';
import { TeamsModule } from '../teams/teams.module';

import { ChampionshipsController } from './championships.controller';
import { ChampionshipsService } from './championships.service';
import { ChampionshipStateMachine } from './services/championship-state-machine.service';
import { ChampionshipPublicationPolicy } from './services/championship-publication.policy';
import { ChampionshipPermissionService } from './services/championship-permission.service';
import { SubscriptionService } from './services/subscription.service';
import { MatchService } from './services/match.service';
import { BracketService } from './services/bracket.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Championship,
      Modality,
      Subscription,
      Match,
      ChampionshipDocument,
      AthleteProfile,
      Team,
    ]),
    TeamsModule,
  ],
  controllers: [ChampionshipsController],
  providers: [
    ChampionshipsService,
    ChampionshipStateMachine,
    ChampionshipPublicationPolicy,
    ChampionshipPermissionService,
    SubscriptionService,
    MatchService,
    BracketService,
  ],
  exports: [
    TypeOrmModule,
    ChampionshipsService,
    SubscriptionService,
    MatchService,
    BracketService,
  ],
})
export class ChampionshipsModule {}
