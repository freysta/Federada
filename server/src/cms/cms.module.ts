import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { TeamMember } from './entities/team-member.entity';
import { News } from './entities/news.entity';
import { Event } from './entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeamMember, News, Event])],
  controllers: [CmsController],
  providers: [CmsService],
})
export class CmsModule {}
