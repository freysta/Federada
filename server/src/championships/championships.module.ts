import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Championship } from './entities/championship.entity';
import { Modality } from './entities/modality.entity';
import { Subscription } from './entities/subscription.entity';
import { TeamsModule } from '../teams/teams.module';

import { ChampionshipsController } from './championships.controller';
import { ChampionshipsService } from './championships.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Championship, Modality, Subscription]),
    TeamsModule,
  ],
  controllers: [ChampionshipsController],
  providers: [ChampionshipsService],
  exports: [TypeOrmModule, ChampionshipsService],
})
export class ChampionshipsModule {}
