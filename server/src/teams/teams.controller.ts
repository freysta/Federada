import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  joinTeam(@Request() req: any, @Body() body: { inviteCode: string; cpf: string; birthDate: Date; course?: string; period?: string }) {
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/documents')
  getPendingDocuments() {
    return this.teamsService.getPendingDocuments();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('admin/documents/:id')
  updateDocumentStatus(
    @Param('id') id: string,
    @Body() body: { type: 'rg' | 'enrollment'; status: 'APPROVED' | 'REJECTED' }
  ) {
    return this.teamsService.updateDocumentStatus(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('my/documents/:type')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @Request() req: any,
    @Param('type') type: 'rg' | 'enrollment',
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.teamsService.uploadDocument(req.user.userId, type, file);
  }
}
