import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChampionshipsService } from './championships.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('championships')
export class ChampionshipsController {
  constructor(private readonly championshipsService: ChampionshipsService) {}

  @Get()
  findAll() {
    return this.championshipsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-subscriptions')
  getMySubscriptions(@Request() req: any) {
    return this.championshipsService.getMySubscriptions(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.championshipsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':modalityId/subscribe')
  subscribe(@Request() req: any, @Param('modalityId') modalityId: string) {
    return this.championshipsService.subscribeAthlete(req.user.userId, modalityId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':modalityId/unsubscribe')
  unsubscribe(@Request() req: any, @Param('modalityId') modalityId: string) {
    return this.championshipsService.unsubscribeAthlete(req.user.userId, modalityId);
  }
}
