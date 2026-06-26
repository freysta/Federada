import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Championship } from './entities/championship.entity';
import { Modality } from './entities/modality.entity';
import { Subscription } from './entities/subscription.entity';
import { ChampionshipDocument } from './entities/championship-document.entity';
import { AthleteProfile } from '../teams/entities/athlete-profile.entity';
import { Team } from '../teams/entities/team.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ChampionshipStateMachine } from './services/championship-state-machine.service';
import { ChampionshipPermissionService } from './services/championship-permission.service';
import { User } from '../orders/entities/user.entity';
import { SubscriptionStatus } from './entities/subscription.entity';
import { ChampionshipStatus } from './entities/championship.entity';

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
    private mailerService: MailerService,
    private stateMachine: ChampionshipStateMachine,
    private permissionService: ChampionshipPermissionService
  ) {}

  async findAll(user: any) {
    const findOptions = this.permissionService.buildFindOptionsForUser(user);
    const champs = await this.championshipRepository.find({ 
      where: findOptions,
      relations: ['modalities'] 
    });

    return champs.map(champ => ({
      ...champ,
      allowedActions: this.stateMachine.getAllowedActions(champ, user?.role, this.permissionService.canManage(champ, user))
    }));
  }

  async findOne(id: string, user?: any) {
    const champ = await this.championshipRepository.findOne({
      where: { id },
      relations: ['modalities', 'owner'],
    });
    if (!champ) throw new NotFoundException('Campeonato não encontrado.');
    
    return {
      ...champ,
      allowedActions: this.stateMachine.getAllowedActions(champ, user?.role, this.permissionService.canManage(champ, user))
    };
  }

  async getDashboardStats() {
    const totalChampionships = await this.championshipRepository.count();
    const totalAthletes = await this.athleteProfileRepository.count();
    const pendingDocuments = await this.athleteProfileRepository.count({
      where: [
        { documentRgStatus: 'PENDING' },
        { documentEnrollmentStatus: 'PENDING' }
      ]
    });
    const totalSubscriptions = await this.subscriptionRepository.count();

    return {
      totalChampionships,
      totalAthletes,
      pendingDocuments,
      totalSubscriptions
    };
  }

  async createChampionship(data: any, user: any) {
    const champ = this.championshipRepository.create({
      ...data,
      owner: { id: user.userId }
    });
    return this.championshipRepository.save(champ);
  }

  async updateChampionship(id: string, data: any, user: any) {
    const champ = await this.championshipRepository.findOne({ where: { id }, relations: ['owner'] });
    if (!champ) throw new NotFoundException('Campeonato não encontrado.');
    
    this.permissionService.assertCanManage(champ, user);

    Object.assign(champ, data);
    return this.championshipRepository.save(champ);
  }

  async changeStatus(id: string, newStatus: ChampionshipStatus, user: any) {
    const champ = await this.championshipRepository.findOne({ where: { id }, relations: ['owner', 'modalities'] });
    if (!champ) throw new NotFoundException('Campeonato não encontrado.');
    
    this.permissionService.assertCanManage(champ, user);

    return this.stateMachine.transition(champ, newStatus, user);
  }

  async addModality(champId: string, data: any, user: any) {
    const champ = await this.championshipRepository.findOne({ where: { id: champId }, relations: ['owner'] });
    if (!champ) throw new NotFoundException('Campeonato não encontrado.');
    
    this.permissionService.assertCanManage(champ, user);

    const modality = this.modalityRepository.create({
      ...data,
      championship: champ
    });
    return this.modalityRepository.save(modality);
  }

  async removeModality(champId: string, modId: string, user: any) {
    const champ = await this.championshipRepository.findOne({ where: { id: champId }, relations: ['owner'] });
    if (!champ) throw new NotFoundException('Campeonato não encontrado.');
    
    this.permissionService.assertCanManage(champ, user);

    const modality = await this.modalityRepository.findOne({ where: { id: modId, championship: { id: champId } } });
    if (!modality) throw new NotFoundException('Modalidade não encontrada no campeonato especificado.');
    
    await this.modalityRepository.remove(modality);
    return { success: true };
  }

  async subscribeAthlete(userId: string, modalityId: string) {
    const profile = await this.athleteProfileRepository.findOne({ where: { user: { id: userId } }, relations: ['team', 'user'] });
    if (!profile) throw new BadRequestException('Você precisa criar ou entrar em uma Atlética primeiro (Perfil de Atleta).');

    const modality = await this.modalityRepository.findOne({ where: { id: modalityId }, relations: ['championship'] });
    if (!modality) throw new NotFoundException('Modalidade não encontrada.');

    if (modality.championship.enrollmentDeadline && new Date() > new Date(modality.championship.enrollmentDeadline)) {
      throw new BadRequestException('O prazo de inscrição para este campeonato já foi encerrado.');
    }

    if (modality.championship.status !== ChampionshipStatus.OPEN) {
      throw new BadRequestException('Este campeonato não está com as inscrições abertas.');
    }

    if (profile.status === 'REJECTED') {
      throw new BadRequestException('Seu perfil possui documentação rejeitada. Regularize antes de se inscrever.');
    }

    if (modality.type === 'COLETIVO') {
      if (profile.teamRole !== 'PRESIDENT') throw new BadRequestException('Apenas o presidente pode inscrever a equipe em modalidades coletivas.');
      if (!profile.team) throw new BadRequestException('Você precisa de uma equipe.');

      const existingSub = await this.subscriptionRepository.findOne({ where: { team: { id: profile.team.id }, modality: { id: modalityId } } });
      if (existingSub) throw new BadRequestException('Sua equipe já está inscrita nesta modalidade.');

      const sub = this.subscriptionRepository.create({
        team: profile.team,
        modality,
        paymentStatus: modality.price > 0 ? 'PENDING' : 'FREE',
        status: SubscriptionStatus.PENDING_ROSTER,
        athletes: []
      });
      return this.subscriptionRepository.save(sub);
    } else {
      const existingSub = await this.subscriptionRepository.findOne({ where: { athlete: { id: profile.id }, modality: { id: modalityId } } });
      if (existingSub) throw new BadRequestException('Você já está inscrito nesta modalidade.');

      this.validateAthleteForModality(profile, modality);

      let needsDocs = false;
      const settings = modality.championship.settings;
      if (settings) {
        if (settings.requireRg && profile.documentRgStatus !== 'APPROVED') needsDocs = true;
        if (settings.requireEnrollment && profile.documentEnrollmentStatus !== 'APPROVED') needsDocs = true;
      }

      const sub = this.subscriptionRepository.create({
        athlete: profile,
        team: profile.team,
        modality,
        paymentStatus: modality.price > 0 ? 'PENDING' : 'FREE',
        status: needsDocs ? SubscriptionStatus.PENDING_DOCS : SubscriptionStatus.CONFIRMED
      });
      return this.subscriptionRepository.save(sub);
    }
  }

  private validateAthleteForModality(profile: AthleteProfile, modality: Modality) {
    if (modality.gender && modality.gender !== 'MISTO') {
      if (!profile.gender) throw new BadRequestException('Gênero não informado no perfil do atleta. Atualize seu perfil.');
      if (profile.gender !== modality.gender) throw new BadRequestException(`Esta modalidade é restrita ao gênero ${modality.gender}.`);
    }

    if (profile.birthDate && (modality.minAge > 0 || modality.maxAge < 99)) {
      const ageDiffMs = Date.now() - new Date(profile.birthDate).getTime();
      const ageDate = new Date(ageDiffMs); 
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      
      if (modality.minAge > 0 && age < modality.minAge) throw new BadRequestException(`Idade mínima para esta modalidade é ${modality.minAge} anos.`);
      if (modality.maxAge < 99 && age > modality.maxAge) throw new BadRequestException(`Idade máxima para esta modalidade é ${modality.maxAge} anos.`);
    }
  }

  async getMySubscriptions(userId: string) {
    const profile = await this.athleteProfileRepository.findOne({ where: { user: { id: userId } }, relations: ['team'] });
    if (!profile) return [];

    const query = this.subscriptionRepository.createQueryBuilder('sub')
      .leftJoinAndSelect('sub.modality', 'modality')
      .leftJoinAndSelect('modality.championship', 'championship')
      .leftJoin('sub.athletes', 'roster')
      .leftJoinAndSelect('sub.athletes', 'rosterSelect')
      .leftJoinAndSelect('rosterSelect.user', 'rosterUser')
      .where('sub.athleteId = :profileId', { profileId: profile.id })
      .orWhere('roster.id = :profileId', { profileId: profile.id });

    if (profile.teamRole === 'PRESIDENT' && profile.team) {
      query.orWhere('sub.teamId = :teamId AND modality.type = :type', { teamId: profile.team.id, type: 'COLETIVO' });
    }

    return query.getMany();
  }

  async addAthleteToRoster(userId: string, subId: string, athleteProfileId: string) {
    const adminProfile = await this.athleteProfileRepository.findOne({ where: { user: { id: userId } }, relations: ['team'] });
    if (!adminProfile || adminProfile.teamRole !== 'PRESIDENT') throw new BadRequestException('Apenas o presidente pode gerenciar o elenco.');

    const sub = await this.subscriptionRepository.findOne({ where: { id: subId }, relations: ['modality', 'modality.championship', 'team', 'athletes'] });
    if (!sub) throw new NotFoundException('Inscrição não encontrada.');
    if (sub.team.id !== adminProfile.team.id) throw new BadRequestException('Esta inscrição pertence a outra equipe.');

    if (sub.modality.championship.enrollmentDeadline && new Date() > new Date(sub.modality.championship.enrollmentDeadline)) {
      throw new BadRequestException('O prazo para alterar o elenco já foi encerrado.');
    }

    if (sub.modality.maxAthletes > 0 && sub.athletes.length >= sub.modality.maxAthletes) {
      throw new BadRequestException(`Limite máximo de ${sub.modality.maxAthletes} atletas atingido.`);
    }

    if (sub.athletes.find(a => a.id === athleteProfileId)) {
      throw new BadRequestException('Atleta já está no elenco desta modalidade.');
    }

    const athlete = await this.athleteProfileRepository.findOne({ where: { id: athleteProfileId }, relations: ['team'] });
    if (!athlete) throw new NotFoundException('Atleta não encontrado.');
    if (athlete.team?.id !== adminProfile.team.id) throw new BadRequestException('Atleta não pertence a sua equipe.');

    this.validateAthleteForModality(athlete, sub.modality);
    sub.athletes.push(athlete);
    
    if (sub.athletes.length >= sub.modality.minAthletes) {
      if (sub.status === SubscriptionStatus.PENDING_DOCS) {
        sub.status = SubscriptionStatus.CONFIRMED;
        await this.subscriptionRepository.save(sub);
      }
    }

    return this.subscriptionRepository.save(sub);
  }

  async removeAthleteFromRoster(userId: string, subId: string, athleteProfileId: string) {
    const adminProfile = await this.athleteProfileRepository.findOne({ where: { user: { id: userId } }, relations: ['team'] });
    if (!adminProfile || adminProfile.teamRole !== 'PRESIDENT') throw new BadRequestException('Apenas o presidente pode gerenciar o elenco.');

    const sub = await this.subscriptionRepository.findOne({ where: { id: subId }, relations: ['modality', 'modality.championship', 'team', 'athletes'] });
    if (!sub) throw new NotFoundException('Inscrição não encontrada.');
    if (sub.team.id !== adminProfile.team.id) throw new BadRequestException('Esta inscrição pertence a outra equipe.');

    if (sub.modality.championship.enrollmentDeadline && new Date() > new Date(sub.modality.championship.enrollmentDeadline)) {
      throw new BadRequestException('O prazo para alterar o elenco já foi encerrado.');
    }

    sub.athletes = sub.athletes.filter(a => a.id !== athleteProfileId);
    if (sub.athletes.length < sub.modality.minAthletes) {
      if (sub.status === SubscriptionStatus.PENDING_DOCS) {
        sub.status = SubscriptionStatus.PENDING_ROSTER;
        await this.subscriptionRepository.save(sub);
      }
    }

    return this.subscriptionRepository.save(sub);
  }

  async unsubscribeAthlete(userId: string, modalityId: string) {
    const profile = await this.athleteProfileRepository.findOne({ where: { user: { id: userId } } });
    if (!profile) throw new BadRequestException('Perfil de atleta não encontrado.');

    const existingSub = await this.subscriptionRepository.findOne({
      where: { athlete: { id: profile.id }, modality: { id: modalityId } }
    });

    if (!existingSub) throw new NotFoundException('Inscrição não encontrada.');

    await this.subscriptionRepository.remove(existingSub);
    return { success: true, message: 'Inscrição cancelada com sucesso.' };
  }

  async getChampionshipSubscriptions(champId: string) {
    return this.subscriptionRepository.find({
      where: { modality: { championship: { id: champId } } },
      relations: ['modality', 'team', 'athlete', 'athlete.user', 'athletes', 'athletes.user'],
      order: { createdAt: 'DESC' }
    });
  }

  async updateSubscriptionStatus(subId: string, status: SubscriptionStatus) {
    const sub = await this.subscriptionRepository.findOne({ where: { id: subId } });
    if (!sub) throw new NotFoundException('Inscrição não encontrada');
    
    sub.status = status;
    return this.subscriptionRepository.save(sub);
  }

  async updateSubscriptionPayment(subId: string, paymentStatus: string) {
    const sub = await this.subscriptionRepository.findOne({ where: { id: subId } });
    if (!sub) throw new NotFoundException('Inscrição não encontrada');
    
    sub.paymentStatus = paymentStatus;
    return this.subscriptionRepository.save(sub);
  }
}
