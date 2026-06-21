import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Championship } from './entities/championship.entity';
import { Modality } from './entities/modality.entity';
import { Subscription } from './entities/subscription.entity';
import { TeamsModule } from '../teams/teams.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Championship, Modality, Subscription]),
    TeamsModule,
  ],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class ChampionshipsModule {}
