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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.championshipsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':modalityId/subscribe')
  subscribe(@Request() req, @Param('modalityId') modalityId: string) {
    return this.championshipsService.subscribeAthlete(req.user.userId, modalityId);
  }
}
