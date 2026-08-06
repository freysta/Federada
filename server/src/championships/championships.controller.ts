import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChampionshipsService } from './championships.service';
import { SubscriptionService } from './services/subscription.service';
import { MatchService } from './services/match.service';
import { BracketService } from './services/bracket.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CreateChampionshipDto } from './dto/create-championship.dto';
import { UpdateChampionshipDto } from './dto/update-championship.dto';
import { CreateModalityDto } from './dto/create-modality.dto';
import { UpdateModalityDto } from './dto/update-modality.dto';
import { GenerateBracketDto } from './dto/generate-bracket.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { ChampionshipStatus } from './entities/championship.entity';
import { SubscriptionStatus } from './entities/subscription.entity';
import { RequestUser } from './championships.service';

@Controller('championships')
export class ChampionshipsController {
  constructor(
    private readonly championshipsService: ChampionshipsService,
    private readonly subscriptionService: SubscriptionService,
    private readonly matchService: MatchService,
    private readonly bracketService: BracketService,
  ) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  findAll(
    @Request() req: { user: RequestUser },
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 10;
    return this.championshipsService.findAll(req.user, p, l);
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
  createChampionship(
    @Body() body: CreateChampionshipDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.championshipsService.createChampionship(body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/enroll-team')
  enrollTeam(
    @Param('id') id: string,
    @Request() req: { user: RequestUser }
  ) {
    return this.championshipsService.enrollTeam(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/my-team-enrollment')
  getTeamEnrollment(
    @Param('id') id: string,
    @Request() req: { user: RequestUser }
  ) {
    return this.championshipsService.getTeamEnrollment(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/athlete-document')
  getAthleteDocument(
    @Param('id') id: string,
    @Request() req: { user: RequestUser }
  ) {
    return this.championshipsService.getAthleteDocument(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/athlete-document')
  saveAthleteDocument(
    @Param('id') id: string,
    @Body('type') type: 'rg' | 'enrollment',
    @Body('url') url: string,
    @Request() req: { user: RequestUser }
  ) {
    return this.championshipsService.saveAthleteDocument(req.user.userId, id, type, url);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/team-dashboard')
  getTeamDashboard(
    @Param('id') id: string,
    @Request() req: { user: RequestUser }
  ) {
    return this.championshipsService.getTeamDashboard(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/subscriptions/:subId/approve')
  approveAthleteSubscription(
    @Param('id') championshipId: string,
    @Param('subId') subscriptionId: string,
    @Request() req: { user: RequestUser }
  ) {
    return this.championshipsService.approveAthleteSubscription(req.user.userId, championshipId, subscriptionId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Patch(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: ChampionshipStatus,
    @Request() req: { user: RequestUser },
  ) {
    return this.championshipsService.changeStatus(id, status, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Get('admin/documents')
  getAdminPendingDocuments() {
    return this.championshipsService.getAdminPendingDocuments();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Patch('admin/documents/:docId')
  updateAdminDocumentStatus(
    @Param('docId') docId: string,
    @Body()
    data: {
      type: 'rg' | 'enrollment';
      status: 'APPROVED' | 'REJECTED';
      rejectionReason?: string;
    },
  ) {
    return this.championshipsService.updateAdminDocumentStatus(docId, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Patch(':id')
  updateChampionship(
    @Param('id') id: string,
    @Body() body: UpdateChampionshipDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.championshipsService.updateChampionship(id, body, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Post(':id/banner')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req: any, file: any, cb: any) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `champ-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req: any, file: any, cb: any) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException('Apenas imagens são permitidas'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadBanner(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Request() req: { user: RequestUser },
  ) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado');
    const bannerUrl = `/uploads/${file.filename}`;
    return this.championshipsService.updateChampionship(
      id,
      { bannerUrl },
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Post(':id/modalities')
  addModality(
    @Param('id') id: string,
    @Body() body: CreateModalityDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.championshipsService.addModality(id, body, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Patch(':id/modalities/:modId')
  updateModality(
    @Param('id') id: string,
    @Param('modId') modId: string,
    @Body() body: UpdateModalityDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.championshipsService.updateModality(id, modId, body, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Delete(':id/modalities/:modId')
  removeModality(
    @Param('id') id: string,
    @Param('modId') modId: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.championshipsService.removeModality(id, modId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-subscriptions')
  getMySubscriptions(@Request() req: { user: RequestUser }) {
    return this.subscriptionService.getMySubscriptions(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Get(':id/subscriptions')
  getChampionshipSubscriptions(@Param('id') id: string) {
    return this.subscriptionService.getChampionshipSubscriptions(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Patch('subscription/:subId/status')
  updateSubscriptionStatus(
    @Param('subId') subId: string,
    @Body('status') status: SubscriptionStatus,
  ) {
    return this.subscriptionService.updateSubscriptionStatus(subId, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Patch('subscription/:subId/payment')
  updateSubscriptionPayment(
    @Param('subId') subId: string,
    @Body('paymentStatus') paymentStatus: string,
  ) {
    return this.subscriptionService.updateSubscriptionPayment(
      subId,
      paymentStatus,
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: RequestUser }) {
    return this.championshipsService.findOne(id, req?.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':modalityId/enroll')
  subscribe(
    @Request() req: { user: RequestUser },
    @Param('modalityId') modalityId: string,
  ) {
    return this.subscriptionService.subscribeAthlete(
      req.user.userId,
      modalityId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscription/:subId/roster/:athleteId')
  addRoster(
    @Request() req: { user: RequestUser },
    @Param('subId') subId: string,
    @Param('athleteId') athleteId: string,
  ) {
    return this.subscriptionService.addAthleteToRoster(
      req.user.userId,
      subId,
      athleteId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('subscription/:subId/roster/:athleteId')
  removeRoster(
    @Request() req: { user: RequestUser },
    @Param('subId') subId: string,
    @Param('athleteId') athleteId: string,
  ) {
    return this.subscriptionService.removeAthleteFromRoster(
      req.user.userId,
      subId,
      athleteId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':modalityId/unenroll')
  unsubscribe(
    @Request() req: { user: RequestUser },
    @Param('modalityId') modalityId: string,
  ) {
    return this.subscriptionService.unsubscribeAthlete(
      req.user.userId,
      modalityId,
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/modalities/:modalityId/matches')
  getMatches(
    @Param('id') championshipId: string,
    @Param('modalityId') modalityId: string,
  ) {
    return this.matchService.getMatches(championshipId, modalityId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Patch(':id/modalities/:modalityId/matches/:matchId')
  updateMatch(
    @Param('id') championshipId: string,
    @Param('modalityId') modalityId: string,
    @Param('matchId') matchId: string,
    @Body() dto: UpdateMatchDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.matchService.updateMatch(
      championshipId,
      modalityId,
      matchId,
      dto,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Post(':id/modalities/:modalityId/generate-bracket')
  generateBracket(
    @Param('id') championshipId: string,
    @Param('modalityId') modalityId: string,
    @Body() dto: GenerateBracketDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.bracketService.generateBracket(
      championshipId,
      modalityId,
      dto,
      req.user,
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/modalities/:modalityId/standings')
  getStandings(
    @Param('id') championshipId: string,
    @Param('modalityId') modalityId: string,
    @Query('group') group?: string,
  ) {
    return this.matchService.getStandings(championshipId, modalityId, group);
  }
}
