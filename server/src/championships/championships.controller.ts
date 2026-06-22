import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChampionshipsService } from './championships.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('championships')
export class ChampionshipsController {
  constructor(private readonly championshipsService: ChampionshipsService) {}

  @Get()
  findAll() {
    return this.championshipsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Get('dashboard')
  getDashboardStats() {
    return this.championshipsService.getDashboardStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Post()
  createChampionship(@Body() body: any) {
    return this.championshipsService.createChampionship(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Patch(':id')
  updateChampionship(@Param('id') id: string, @Body() body: any) {
    return this.championshipsService.updateChampionship(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Post(':id/modalities')
  addModality(@Param('id') id: string, @Body() body: any) {
    return this.championshipsService.addModality(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Delete(':id/modalities/:modId')
  removeModality(@Param('id') id: string, @Param('modId') modId: string) {
    return this.championshipsService.removeModality(id, modId);
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
