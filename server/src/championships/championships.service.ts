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
import { SubscriptionStatus } from './entities/subscription.entity';
import { AthleteChampionshipDocument } from './entities/athlete-championship-document.entity';
import { Match } from './entities/match.entity';
import { TeamChampionshipEnrollment } from './entities/team-championship-enrollment.entity';
import { BracketFormat, GenerateBracketDto } from './dto/generate-bracket.dto';
import { AthleteProfile } from '../teams/entities/athlete-profile.entity';
import { Team } from '../teams/entities/team.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ChampionshipStateMachine } from './services/championship-state-machine.service';
import { ChampionshipPermissionService } from './services/championship-permission.service';
import { User } from '../orders/entities/user.entity';
import { ChampionshipStatus } from './entities/championship.entity';
import { CreateChampionshipDto } from './dto/create-championship.dto';
import { UpdateChampionshipDto } from './dto/update-championship.dto';
import { CreateModalityDto } from './dto/create-modality.dto';
import { UpdateModalityDto } from './dto/update-modality.dto';

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
    @InjectRepository(TeamChampionshipEnrollment)
    private teamEnrollmentRepository: Repository<TeamChampionshipEnrollment>,
    @InjectRepository(AthleteChampionshipDocument)
    private athleteDocumentRepository: Repository<AthleteChampionshipDocument>,
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
      this.athleteDocumentRepository.count({
        where: [
          { rgStatus: 'PENDING' },
          { enrollmentStatus: 'PENDING' },
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

  async enrollTeam(userId: string, championshipId: string) {
    const profile = await this.athleteProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['team'],
    });

    if (!profile || profile.teamRole !== 'PRESIDENT' || !profile.team) {
      throw new BadRequestException('Apenas o presidente pode inscrever a atlética em campeonatos.');
    }

    const championship = await this.championshipRepository.findOne({
      where: { id: championshipId }
    });

    if (!championship) {
      throw new NotFoundException('Campeonato não encontrado.');
    }

    if (championship.enrollmentDeadline && new Date() > new Date(championship.enrollmentDeadline)) {
      throw new BadRequestException('O prazo de inscrição para este campeonato já foi encerrado.');
    }

    const existingEnrollment = await this.teamEnrollmentRepository.findOne({
      where: { team: { id: profile.team.id }, championship: { id: championshipId } }
    });

    if (existingEnrollment) {
      throw new BadRequestException('Sua atlética já está inscrita neste campeonato.');
    }

    const enrollment = this.teamEnrollmentRepository.create({
      team: profile.team,
      championship
    });

    return this.teamEnrollmentRepository.save(enrollment);
  }

  async getTeamEnrollment(userId: string, championshipId: string) {
    const profile = await this.athleteProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['team'],
    });

    if (!profile || !profile.team) return null;

    return this.teamEnrollmentRepository.findOne({
      where: { team: { id: profile.team.id }, championship: { id: championshipId } }
    });
  }

  async getAthleteDocument(userId: string, championshipId: string) {
    return this.athleteDocumentRepository.findOne({
      where: { athlete: { user: { id: userId } }, championship: { id: championshipId } }
    });
  }

  async saveAthleteDocument(userId: string, championshipId: string, type: 'rg' | 'enrollment', url: string, targetAthleteId?: string) {
    const loggedProfile = await this.athleteProfileRepository.findOne({ 
      where: { user: { id: userId } },
      relations: ['team']
    });
    if (!loggedProfile) throw new BadRequestException('Perfil de atleta não encontrado.');

    let profileToUpdate = loggedProfile;

    if (targetAthleteId) {
      if (loggedProfile.teamRole !== 'PRESIDENT') {
        throw new BadRequestException('Apenas o presidente pode enviar documentos de outros atletas.');
      }
      
      const targetProfile = await this.athleteProfileRepository.findOne({
        where: { id: targetAthleteId },
        relations: ['team'],
      });

      if (!targetProfile || targetProfile.team?.id !== loggedProfile.team?.id) {
        throw new BadRequestException('Atleta não encontrado ou não pertence a sua equipe.');
      }
      
      profileToUpdate = targetProfile;
    }

    const profile = profileToUpdate;

    const championship = await this.championshipRepository.findOne({ where: { id: championshipId } });
    if (!championship) throw new NotFoundException('Campeonato não encontrado.');

    let doc = await this.athleteDocumentRepository.findOne({
      where: { athlete: { id: profile.id }, championship: { id: championshipId } }
    });

    if (!doc) {
      doc = this.athleteDocumentRepository.create({ athlete: profile, championship });
    }

    if (type === 'rg') {
      doc.rgUrl = url;
      doc.rgStatus = 'PENDING';
      doc.rgRejectionReason = null;
    } else {
      doc.enrollmentUrl = url;
      doc.enrollmentStatus = 'PENDING';
      doc.enrollmentRejectionReason = null;
    }

    return this.athleteDocumentRepository.save(doc);
  }

  async getTeamDashboard(userId: string, championshipId: string) {
    const profile = await this.athleteProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['team'],
    });

    if (!profile || profile.teamRole !== 'PRESIDENT' || !profile.team) {
      throw new BadRequestException('Acesso negado. Apenas o presidente pode acessar o painel.');
    }

    // Busca as inscrições da equipe neste campeonato
    const subscriptions = await this.subscriptionRepository.find({
      where: { team: { id: profile.team.id }, modality: { championship: { id: championshipId } } },
      relations: ['modality', 'athlete', 'athlete.user'],
    });

    // Busca os documentos dos atletas da equipe neste campeonato
    const documents = await this.athleteDocumentRepository.find({
      where: { athlete: { team: { id: profile.team.id } }, championship: { id: championshipId } },
      relations: ['athlete', 'athlete.user'],
    });

    return {
      subscriptions,
      documents,
    };
  }

  async approveAthleteSubscription(userId: string, championshipId: string, subscriptionId: string) {
    const profile = await this.athleteProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['team'],
    });

    if (!profile || profile.teamRole !== 'PRESIDENT' || !profile.team) {
      throw new BadRequestException('Apenas o presidente pode aprovar inscrições.');
    }

    const sub = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId, team: { id: profile.team.id } },
      relations: ['modality', 'modality.championship']
    });

    if (!sub) throw new NotFoundException('Inscrição não encontrada ou não pertence à sua equipe.');
    
    if (sub.modality.championship.id !== championshipId) {
      throw new BadRequestException('A inscrição não pertence a este campeonato.');
    }

    if (sub.status !== SubscriptionStatus.PENDING_TEAM_APPROVAL) {
      throw new BadRequestException('Esta inscrição não está pendente de aprovação pela atlética.');
    }

    sub.status = SubscriptionStatus.PENDING_DOCS;
    return this.subscriptionRepository.save(sub);
  }

  async getAdminPendingDocuments(championshipId?: string) {
    const whereCondition = championshipId ? { championship: { id: championshipId } } : {};
    return this.athleteDocumentRepository.find({
      where: whereCondition,
      relations: ['athlete', 'athlete.user', 'athlete.team', 'championship'],
      order: { createdAt: 'DESC' }
    });
  }

  async updateAdminDocumentStatus(docId: string, data: { type: 'rg' | 'enrollment'; status: 'APPROVED' | 'REJECTED'; rejectionReason?: string }) {
    const doc = await this.athleteDocumentRepository.findOne({ where: { id: docId } });
    if (!doc) throw new NotFoundException('Documento não encontrado');

    if (data.type === 'rg') {
      doc.rgStatus = data.status;
      doc.rgRejectionReason = data.status === 'REJECTED' ? (data.rejectionReason || null) : null;
    } else {
      doc.enrollmentStatus = data.status;
      doc.enrollmentRejectionReason = data.status === 'REJECTED' ? (data.rejectionReason || null) : null;
    }

    return this.athleteDocumentRepository.save(doc);
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

  async updateModality(champId: string, modId: string, data: UpdateModalityDto, user: RequestUser) {
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
      throw new NotFoundException('Modalidade não encontrada no campeonato especificado.');

    Object.assign(modality, data);
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

    const activeSubscriptions = await this.subscriptionRepository.count({
      where: { modality: { id: modId } },
    });

    if (activeSubscriptions > 0) {
      throw new BadRequestException('Não é possível excluir uma modalidade que possui equipes ou atletas inscritos.');
    }

    await this.modalityRepository.remove(modality);
    return { success: true };
  }
}
