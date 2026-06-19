import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TeamMemberDto } from './dto/team-member.dto';
import { NewsDto } from './dto/news.dto';
import { EventDto } from './dto/event.dto';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('team')
  getTeam() {
    return this.cmsService.getTeam();
  }

  @Get('news')
  getNews() {
    return this.cmsService.getNews();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('team')
  createTeamMember(@Body() data: TeamMemberDto) {
    return this.cmsService.createTeamMember(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('team/:id')
  updateTeamMember(@Param('id') id: string, @Body() data: TeamMemberDto) {
    return this.cmsService.updateTeamMember(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('team/:id')
  deleteTeamMember(@Param('id') id: string) {
    return this.cmsService.deleteTeamMember(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('news')
  createNews(@Body() data: NewsDto) {
    return this.cmsService.createNews(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('news/:id')
  updateNews(@Param('id') id: string, @Body() data: NewsDto) {
    return this.cmsService.updateNews(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('news/:id')
  deleteNews(@Param('id') id: string) {
    return this.cmsService.deleteNews(id);
  }

  @Get('events')
  getEvents() {
    return this.cmsService.getEvents();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('events')
  createEvent(@Body() data: EventDto) {
    return this.cmsService.createEvent(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('events/:id')
  updateEvent(@Param('id') id: string, @Body() data: EventDto) {
    return this.cmsService.updateEvent(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('events/:id')
  deleteEvent(@Param('id') id: string) {
    return this.cmsService.deleteEvent(id);
  }

  @Get('instagram')
  getInstagramFeed() {
    return this.cmsService.getInstagramFeed();
  }
}
