import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChampionshipsService } from './championships.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CreateChampionshipDto } from './dto/create-championship.dto';
import { UpdateChampionshipDto } from './dto/update-championship.dto';
import { CreateModalityDto } from './dto/create-modality.dto';
import { ChampionshipStatus } from './entities/championship.entity';
import { SubscriptionStatus } from './entities/subscription.entity';

@Controller('championships')
export class ChampionshipsController {
  constructor(private readonly championshipsService: ChampionshipsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req: any) {
    return this.championshipsService.findAll(req.user);
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
  createChampionship(@Body() body: CreateChampionshipDto, @Request() req: any) {
    return this.championshipsService.createChampionship(body, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body('status') status: ChampionshipStatus, @Request() req: any) {
    return this.championshipsService.changeStatus(id, status, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Patch(':id')
  updateChampionship(@Param('id') id: string, @Body() body: UpdateChampionshipDto, @Request() req: any) {
    return this.championshipsService.updateChampionship(id, body, req.user);
  }



  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Post(':id/banner')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req: any, file: any, cb: any) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `champ-${uniqueSuffix}${ext}`);
      }
    }),
    fileFilter: (req: any, file: any, cb: any) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new BadRequestException('Apenas imagens são permitidas'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }
  }))
  uploadBanner(@Param('id') id: string, @UploadedFile() file: any, @Request() req: any) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado');
    const bannerUrl = `/uploads/${file.filename}`;
    return this.championshipsService.updateChampionship(id, { bannerUrl }, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Post(':id/modalities')
  addModality(@Param('id') id: string, @Body() body: CreateModalityDto, @Request() req: any) {
    return this.championshipsService.addModality(id, body, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Delete(':id/modalities/:modId')
  removeModality(@Param('id') id: string, @Param('modId') modId: string, @Request() req: any) {
    return this.championshipsService.removeModality(id, modId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-subscriptions')
  getMySubscriptions(@Request() req: any) {
    return this.championshipsService.getMySubscriptions(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Get(':id/subscriptions')
  getChampionshipSubscriptions(@Param('id') id: string) {
    return this.championshipsService.getChampionshipSubscriptions(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Patch('subscription/:subId/status')
  updateSubscriptionStatus(@Param('subId') subId: string, @Body('status') status: SubscriptionStatus) {
    return this.championshipsService.updateSubscriptionStatus(subId, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SPORTS_ADMIN')
  @Patch('subscription/:subId/payment')
  updateSubscriptionPayment(@Param('subId') subId: string, @Body('paymentStatus') paymentStatus: string) {
    return this.championshipsService.updateSubscriptionPayment(subId, paymentStatus);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.championshipsService.findOne(id, req?.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':modalityId/enroll')
  subscribe(@Request() req: any, @Param('modalityId') modalityId: string) {
    return this.championshipsService.subscribeAthlete(req.user.userId, modalityId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscription/:subId/roster/:athleteId')
  addRoster(@Request() req: any, @Param('subId') subId: string, @Param('athleteId') athleteId: string) {
    return this.championshipsService.addAthleteToRoster(req.user.userId, subId, athleteId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('subscription/:subId/roster/:athleteId')
  removeRoster(@Request() req: any, @Param('subId') subId: string, @Param('athleteId') athleteId: string) {
    return this.championshipsService.removeAthleteFromRoster(req.user.userId, subId, athleteId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':modalityId/unenroll')
  unsubscribe(@Request() req: any, @Param('modalityId') modalityId: string) {
    return this.championshipsService.unsubscribeAthlete(req.user.userId, modalityId);
  }
}
