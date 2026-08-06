import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateTeamDto } from './dto/create-team.dto';
import { JoinTeamDto } from './dto/join-team.dto';
import { RequestJoinTeamDto } from './dto/request-join-team.dto';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createTeam(@Request() req: any, @Body() body: CreateTeamDto) {
    return this.teamsService.createTeam(req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.teamsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('join')
  joinTeam(@Request() req: any, @Body() body: JoinTeamDto) {
    return this.teamsService.joinTeam(req.user.userId, body.inviteCode, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/request-join')
  requestJoinTeam(@Request() req: any, @Param('id') id: string, @Body() body: RequestJoinTeamDto) {
    return this.teamsService.requestJoinTeam(req.user.userId, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-team/join-requests')
  getJoinRequests(@Request() req: any) {
    return this.teamsService.getJoinRequests(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('my-team/requests/:profileId/status')
  updateJoinStatus(
    @Request() req: any,
    @Param('profileId') profileId: string,
    @Body('status') status: 'APPROVED' | 'REJECTED'
  ) {
    return this.teamsService.updateJoinStatus(req.user.userId, profileId, status);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('my-team/members/:memberId')
  removeMemberFromMyTeam(
    @Request() req: any,
    @Param('memberId') memberId: string,
  ) {
    return this.teamsService.removeMemberFromMyTeam(req.user.userId, memberId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('my-team/members/:memberId/role')
  updateMemberRole(
    @Request() req: any,
    @Param('memberId') memberId: string,
    @Body('role') role: 'PRESIDENT' | 'MEMBER'
  ) {
    return this.teamsService.updateMemberRole(req.user.userId, memberId, role);
  }

  @Get('invite/:code')
  getInviteInfo(@Param('code') code: string) {
    return this.teamsService.getInviteInfo(code);
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
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Get('admin/documents')
  getPendingDocuments() {
    return this.teamsService.getPendingDocuments();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Patch('profile/:profileId/documents')
  updateDocumentStatus(
    @Param('profileId') profileId: string,
    @Body()
    data: {
      type: 'rg' | 'enrollment';
      status: 'APPROVED' | 'REJECTED';
      rejectionReason?: string;
    },
  ) {
    return this.teamsService.updateDocumentStatus(profileId, data);
  }

  // ==== AVAILABILITY ====
  @UseGuards(JwtAuthGuard)
  @Post('availability/:championshipId')
  setAvailability(
    @Request() req: any,
    @Param('championshipId') championshipId: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.teamsService.setAvailability(
      req.user.userId,
      championshipId,
      isAvailable,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':teamId/availability/:championshipId')
  getAvailabilities(
    @Param('teamId') teamId: string,
    @Param('championshipId') championshipId: string,
  ) {
    return this.teamsService.getAvailabilities(teamId, championshipId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('my/documents/:type')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @Request() req: any,
    @Param('type') type: 'rg' | 'enrollment',
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.teamsService.uploadDocument(req.user.userId, type, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('my/membership')
  leaveTeam(@Request() req: any) {
    return this.teamsService.leaveTeam(req.user.userId);
  }

  // ==== ADMIN TEAM MANAGEMENT ====
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Get('admin/all')
  findAllAdmin() {
    return this.teamsService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Post('admin')
  createTeamByAdmin(@Body() data: any) {
    return this.teamsService.createTeamByAdmin(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Put(':id')
  updateTeamByAdmin(@Param('id') id: string, @Body() data: any) {
    return this.teamsService.updateTeamByAdmin(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Delete(':id')
  deleteTeamByAdmin(@Param('id') id: string) {
    return this.teamsService.deleteTeamByAdmin(id);
  }
}
