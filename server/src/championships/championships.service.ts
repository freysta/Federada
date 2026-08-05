import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Championship } from './entities/championship.entity';
import { Modality } from './entities/modality.entity';
import { Subscription } from './entities/subscription.entity';
import { ChampionshipDocument } from './entities/championship-document.entity';
import { Match } from './entities/match.entity';
import { BracketFormat, GenerateBracketDto } from './dto/generate-bracket.dto';
import { AthleteProfile } from '../teams/entities/athlete-profile.entity';
import { Team } from '../teams/entities/team.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ChampionshipStateMachine } from './services/championship-state-machine.service';
import { ChampionshipPermissionService } from './services/championship-permission.service';
import { User } from '../orders/entities/user.entity';
import { SubscriptionStatus } from './entities/subscription.entity';
import { ChampionshipStatus } from './entities/championship.entity';
import { CreateChampionshipDto } from './dto/create-championship.dto';
import { UpdateChampionshipDto } from './dto/update-championship.dto';
import { CreateModalityDto } from './dto/create-modality.dto';

export interface RequestUser {
  userId: string;
  role: string;
  email?: string;
}
@Injectable()
export class ChampionshipsService {
  constructor(
    @InjectRepository(Championship)
    private championshipRepository: Repository<Championship>,
    @InjectRepository(Modality)
    private modalityRepository: Repository<Modality>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(AthleteProfile)
    private athleteProfileRepository: Repository<AthleteProfile>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(ChampionshipDocument)
    private championshipDocumentRepository: Repository<ChampionshipDocument>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    private mailerService: MailerService,
    private stateMachine: ChampionshipStateMachine,
    private permissionService: ChampionshipPermissionService,
  ) {}

  async findAll(user: RequestUser, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const findOptions = this.permissionService.buildFindOptionsForUser(user);
    const [champs, total] = await this.championshipRepository.findAndCount({
      where: findOptions,
      relations: ['modalities', 'owner'],
      skip,
      take: limit,
    });

    const data = champs.map((champ) => ({
      ...champ,
      allowedActions: this.stateMachine.getAllowedActions(
        champ,
        user?.role,
        this.permissionService.canManage(champ, user),
      ),
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, user?: RequestUser) {
    const champ = await this.championshipRepository.findOne({
      where: { id },
      relations: ['modalities', 'owner'],
    });
    if (!champ) throw new NotFoundException('Campeonato não encontrado.');

    return {
      ...champ,
      allowedActions: this.stateMachine.getAllowedActions(
        champ,
        user?.role || '',
        this.permissionService.canManage(champ, user),
      ),
    };
  }

  async getDashboardStats() {
    const [
      totalChampionships,
      totalAthletes,
      pendingDocuments,
      totalSubscriptions,
    ] = await Promise.all([
      this.championshipRepository.count(),
      this.athleteProfileRepository.count(),
      this.athleteProfileRepository.count({
        where: [
          { documentRgStatus: 'PENDING' },
          { documentEnrollmentStatus: 'PENDING' },
        ],
      }),
      this.subscriptionRepository.count(),
    ]);

    return {
      totalChampionships,
      totalAthletes,
      pendingDocuments,
      totalSubscriptions,
    };
  }

  async createChampionship(data: CreateChampionshipDto, user: RequestUser) {
    const champ = this.championshipRepository.create({
      ...data,
      owner: { id: user.userId },
    });
    return this.championshipRepository.save(champ);
  }

  async updateChampionship(
    id: string,
    data: UpdateChampionshipDto,
    user: RequestUser,
  ) {
    const champ = await this.championshipRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!champ) throw new NotFoundException('Campeonato não encontrado.');

    this.permissionService.assertCanManage(champ, user);

    Object.assign(champ, data);
    return this.championshipRepository.save(champ);
  }

  async changeStatus(
    id: string,
    newStatus: ChampionshipStatus,
    user: RequestUser,
  ) {
    const champ = await this.championshipRepository.findOne({
      where: { id },
      relations: ['owner', 'modalities'],
    });
    if (!champ) throw new NotFoundException('Campeonato não encontrado.');

    this.permissionService.assertCanManage(champ, user);

    return this.stateMachine.transition(champ, newStatus, user);
  }

  async addModality(
    champId: string,
    data: CreateModalityDto,
    user: RequestUser,
  ) {
    const champ = await this.championshipRepository.findOne({
      where: { id: champId },
      relations: ['owner'],
    });
    if (!champ) throw new NotFoundException('Campeonato não encontrado.');

    this.permissionService.assertCanManage(champ, user);

    const modality = this.modalityRepository.create({
      ...data,
      championship: champ,
    });
    return this.modalityRepository.save(modality);
  }

  async removeModality(champId: string, modId: string, user: RequestUser) {
    const champ = await this.championshipRepository.findOne({
      where: { id: champId },
      relations: ['owner'],
    });
    if (!champ) throw new NotFoundException('Campeonato não encontrado.');

    this.permissionService.assertCanManage(champ, user);

    const modality = await this.modalityRepository.findOne({
      where: { id: modId, championship: { id: champId } },
    });
    if (!modality)
      throw new NotFoundException(
        'Modalidade não encontrada no campeonato especificado.',
      );

    await this.modalityRepository.remove(modality);
    return { success: true };
  }
}
