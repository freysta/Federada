import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createTeam(@Request() req: any, @Body() body: { name: string; university?: string; logoUrl?: string }) {
    return this.teamsService.createTeam(req.user.userId, body);
  }

  @Get()
  findAll() {
    return this.teamsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('join')
  joinTeam(@Request() req: any, @Body() body: { inviteCode: string; cpf: string; birthDate: Date; course?: string; period?: string; enrollmentProofUrl?: string }) {
    return this.teamsService.joinTeam(req.user.userId, body.inviteCode, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/members')
  getTeamMembers(@Param('id') id: string) {
    return this.teamsService.getTeamMembers(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/profile')
  getMyProfile(@Request() req: any) {
    return this.teamsService.getMyProfile(req.user.userId);
  }
}
