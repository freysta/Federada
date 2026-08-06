import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { AthleteProfile } from '../../teams/entities/athlete-profile.entity';
import { Modality } from '../entities/modality.entity';
import { SubscriptionStatus } from '../entities/subscription.entity';
import { ChampionshipStatus } from '../entities/championship.entity';
import { TeamChampionshipEnrollment } from '../entities/team-championship-enrollment.entity';
import { AthleteChampionshipDocument } from '../entities/athlete-championship-document.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(AthleteProfile)
    private athleteProfileRepository: Repository<AthleteProfile>,
    @InjectRepository(Modality)
    private modalityRepository: Repository<Modality>,
    @InjectRepository(TeamChampionshipEnrollment)
    private teamEnrollmentRepository: Repository<TeamChampionshipEnrollment>,
    @InjectRepository(AthleteChampionshipDocument)
    private athleteDocumentRepository: Repository<AthleteChampionshipDocument>,
  ) {}

  async subscribeAthlete(userId: string, modalityId: string) {
    const profile = await this.athleteProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['team', 'user'],
    });
    if (!profile)
      throw new BadRequestException(
        'Você precisa criar ou entrar em uma Atlética primeiro (Perfil de Atleta).',
      );

    const modality = await this.modalityRepository.findOne({
      where: { id: modalityId },
      relations: ['championship'],
    });
    if (!modality) throw new NotFoundException('Modalidade não encontrada.');

    if (
      modality.championship.enrollmentDeadline &&
      new Date() > new Date(modality.championship.enrollmentDeadline)
    ) {
      throw new BadRequestException(
        'O prazo de inscrição para este campeonato já foi encerrado.',
      );
    }

    if (modality.championship.status !== ChampionshipStatus.OPEN) {
      throw new BadRequestException(
        'Este campeonato não está com as inscrições abertas.',
      );
    }

    if (profile.status === 'REJECTED') {
      throw new BadRequestException(
        'Seu perfil possui documentação rejeitada. Regularize antes de se inscrever.',
      );
    }

    if (modality.maxSpots) {
      const currentSubscriptions = await this.subscriptionRepository.count({
        where: { modality: { id: modalityId } },
      });

      if (currentSubscriptions >= modality.maxSpots) {
        throw new BadRequestException('Vagas esgotadas para esta modalidade.');
      }
    }

    if (modality.championship.audienceFocus === 'UNIVERSITY') {
      if (!profile.team) {
        throw new BadRequestException(
          'Para campeonatos universitários, você precisa solicitar vínculo a uma atlética antes de se inscrever.',
        );
      }
      if (profile.teamJoinStatus !== 'APPROVED') {
        throw new BadRequestException(
          'Seu vínculo com a atlética ainda está pendente ou foi recusado. Aguarde a aprovação do presidente.',
        );
      }

      const teamEnrollment = await this.teamEnrollmentRepository.findOne({
        where: {
          team: { id: profile.team.id },
          championship: { id: modality.championship.id }
        }
      });

      if (!teamEnrollment) {
        throw new BadRequestException(
          'Sua equipe precisa estar inscrita neste campeonato pelo presidente antes de você se inscrever em modalidades.',
        );
      }
    }

    if (modality.type === 'COLETIVO') {
      if (profile.teamRole !== 'PRESIDENT')
        throw new BadRequestException(
          'Apenas o presidente pode inscrever a equipe em modalidades coletivas.',
        );
      if (!profile.team)
        throw new BadRequestException('Você precisa de uma equipe.');

      const existingSub = await this.subscriptionRepository.findOne({
        where: { team: { id: profile.team.id }, modality: { id: modalityId } },
      });
      if (existingSub)
        throw new BadRequestException(
          'Sua equipe já está inscrita nesta modalidade.',
        );

      const sub = this.subscriptionRepository.create({
        team: profile.team,
        modality,
        paymentStatus: modality.price > 0 ? 'PENDING' : 'FREE',
        status: SubscriptionStatus.PENDING_ROSTER,
        athletes: [],
      });
      return this.subscriptionRepository.save(sub);
    } else {
      const existingSub = await this.subscriptionRepository.findOne({
        where: { athlete: { id: profile.id }, modality: { id: modalityId } },
      });
      if (existingSub)
        throw new BadRequestException(
          'Você já está inscrito nesta modalidade.',
        );

      this.validateAthleteForModality(profile, modality);

      let needsDocs = false;
      const settings = modality.championship.settings;
      if (settings && (settings.requireRg || settings.requireEnrollment)) {
        const athleteDoc = await this.athleteDocumentRepository.findOne({
          where: { athlete: { id: profile.id }, championship: { id: modality.championship.id } }
        });

        if (!athleteDoc) {
          needsDocs = true;
        } else {
          if (settings.requireRg && athleteDoc.rgStatus !== 'APPROVED') needsDocs = true;
          if (settings.requireEnrollment && athleteDoc.enrollmentStatus !== 'APPROVED') needsDocs = true;
        }
      }

      let initialStatus = SubscriptionStatus.PENDING_DOCS;
      if (modality.championship.audienceFocus === 'UNIVERSITY') {
        initialStatus = SubscriptionStatus.PENDING_TEAM_APPROVAL;
      } else if (!needsDocs) {
        initialStatus = modality.price > 0 ? SubscriptionStatus.PENDING_PAYMENT : SubscriptionStatus.CONFIRMED;
      }

      const sub = this.subscriptionRepository.create({
        athlete: profile,
        modality,
        paymentStatus: modality.price > 0 ? 'PENDING' : 'FREE',
        status: initialStatus,
        team: profile.team, // Vincula a inscrição do atleta à equipe atual dele
      });
      return this.subscriptionRepository.save(sub);
    }
  }

  private validateAthleteForModality(
    profile: AthleteProfile,
    modality: Modality,
  ) {
    if (modality.gender && modality.gender !== 'MISTO') {
      if (!profile.gender)
        throw new BadRequestException(
          'Gênero não informado no perfil do atleta. Atualize seu perfil.',
        );
      if (profile.gender !== modality.gender)
        throw new BadRequestException(
          `Esta modalidade é restrita ao gênero ${modality.gender}.`,
        );
    }

    if (profile.birthDate && (modality.minAge > 0 || modality.maxAge < 99)) {
      const ageDiffMs = Date.now() - new Date(profile.birthDate).getTime();
      const ageDate = new Date(ageDiffMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);

      if (modality.minAge > 0 && age < modality.minAge)
        throw new BadRequestException(
          `Idade mínima para esta modalidade é ${modality.minAge} anos.`,
        );
      if (modality.maxAge < 99 && age > modality.maxAge)
        throw new BadRequestException(
          `Idade máxima para esta modalidade é ${modality.maxAge} anos.`,
        );
    }
  }

  async getMySubscriptions(userId: string) {
    const profile = await this.athleteProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['team'],
    });
    if (!profile) return [];

    const query = this.subscriptionRepository
      .createQueryBuilder('sub')
      .leftJoinAndSelect('sub.modality', 'modality')
      .leftJoinAndSelect('modality.championship', 'championship')
      .leftJoin('sub.athletes', 'roster')
      .leftJoinAndSelect('sub.athletes', 'rosterSelect')
      .leftJoinAndSelect('rosterSelect.user', 'rosterUser')
      .where('sub.athleteId = :profileId', { profileId: profile.id })
      .orWhere('roster.id = :profileId', { profileId: profile.id });

    if (profile.team) {
      query.orWhere('sub.teamId = :teamId AND modality.type = :type', {
        teamId: profile.team.id,
        type: 'COLETIVO',
      });
    }

    return query.getMany();
  }

  async addAthleteToRoster(
    userId: string,
    subId: string,
    athleteProfileId: string,
  ) {
    const adminProfile = await this.athleteProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['team'],
    });
    if (!adminProfile) throw new BadRequestException('Perfil não encontrado.');
    if (
      adminProfile.teamRole !== 'PRESIDENT' &&
      adminProfile.id !== athleteProfileId
    ) {
      throw new BadRequestException(
        'Apenas o presidente pode gerenciar outros atletas no elenco.',
      );
    }

    const sub = await this.subscriptionRepository.findOne({
      where: { id: subId },
      relations: ['modality', 'modality.championship', 'team', 'athletes'],
    });
    if (!sub) throw new NotFoundException('Inscrição não encontrada.');
    if (sub.team.id !== adminProfile.team.id)
      throw new BadRequestException('Esta inscrição pertence a outra equipe.');

    if (
      sub.modality.championship.enrollmentDeadline &&
      new Date() > new Date(sub.modality.championship.enrollmentDeadline)
    ) {
      throw new BadRequestException(
        'O prazo para alterar o elenco já foi encerrado.',
      );
    }

    if (
      sub.modality.maxAthletes > 0 &&
      sub.athletes.length >= sub.modality.maxAthletes
    ) {
      throw new BadRequestException(
        `Limite máximo de ${sub.modality.maxAthletes} atletas atingido.`,
      );
    }

    if (sub.athletes.find((a) => a.id === athleteProfileId)) {
      throw new BadRequestException(
        'Atleta já está no elenco desta modalidade.',
      );
    }

    const athlete = await this.athleteProfileRepository.findOne({
      where: { id: athleteProfileId },
      relations: ['team'],
    });
    if (!athlete) throw new NotFoundException('Atleta não encontrado.');
    if (athlete.team?.id !== adminProfile.team.id)
      throw new BadRequestException('Atleta não pertence a sua equipe.');

    this.validateAthleteForModality(athlete, sub.modality);
    sub.athletes.push(athlete);

    if (sub.athletes.length >= sub.modality.minAthletes) {
      if (sub.status === SubscriptionStatus.PENDING_ROSTER) {
        let needsDocs = false;
        const settings = sub.modality.championship.settings;
        if (settings && (settings.requireRg || settings.requireEnrollment)) {
          needsDocs = true;
        }
        sub.status = needsDocs
          ? SubscriptionStatus.PENDING_DOCS
          : SubscriptionStatus.CONFIRMED;
      }
    }

    return this.subscriptionRepository.save(sub);
  }

  async removeAthleteFromRoster(
    userId: string,
    subId: string,
    athleteProfileId: string,
  ) {
    const adminProfile = await this.athleteProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['team'],
    });
    if (!adminProfile) throw new BadRequestException('Perfil não encontrado.');
    if (
      adminProfile.teamRole !== 'PRESIDENT' &&
      adminProfile.id !== athleteProfileId
    ) {
      throw new BadRequestException(
        'Apenas o presidente pode gerenciar outros atletas no elenco.',
      );
    }

    const sub = await this.subscriptionRepository.findOne({
      where: { id: subId },
      relations: ['modality', 'modality.championship', 'team', 'athletes'],
    });
    if (!sub) throw new NotFoundException('Inscrição não encontrada.');
    if (sub.team.id !== adminProfile.team.id)
      throw new BadRequestException('Esta inscrição pertence a outra equipe.');

    if (
      sub.modality.championship.enrollmentDeadline &&
      new Date() > new Date(sub.modality.championship.enrollmentDeadline)
    ) {
      throw new BadRequestException(
        'O prazo para alterar o elenco já foi encerrado.',
      );
    }

    sub.athletes = sub.athletes.filter((a) => a.id !== athleteProfileId);
    if (sub.athletes.length < sub.modality.minAthletes) {
      if (
        sub.status === SubscriptionStatus.PENDING_DOCS ||
        sub.status === SubscriptionStatus.CONFIRMED ||
        sub.status === SubscriptionStatus.DOCS_APPROVED ||
        sub.status === SubscriptionStatus.PENDING_PAYMENT
      ) {
        sub.status = SubscriptionStatus.PENDING_ROSTER;
      }
    }

    return this.subscriptionRepository.save(sub);
  }

  async unsubscribeAthlete(userId: string, modalityId: string) {
    const profile = await this.athleteProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['team'],
    });
    if (!profile)
      throw new BadRequestException('Perfil de atleta não encontrado.');

    const modality = await this.modalityRepository.findOne({
      where: { id: modalityId },
    });
    if (!modality) throw new NotFoundException('Modalidade não encontrada.');

    let existingSub;
    if (modality.type === 'COLETIVO') {
      if (profile.teamRole !== 'PRESIDENT')
        throw new BadRequestException(
          'Apenas o presidente pode cancelar a inscrição da equipe.',
        );
      if (!profile.team)
        throw new BadRequestException('Você precisa de uma equipe.');

      existingSub = await this.subscriptionRepository.findOne({
        where: { team: { id: profile.team.id }, modality: { id: modalityId } },
      });
    } else {
      existingSub = await this.subscriptionRepository.findOne({
        where: { athlete: { id: profile.id }, modality: { id: modalityId } },
      });
    }

    if (!existingSub) throw new NotFoundException('Inscrição não encontrada.');

    await this.subscriptionRepository.remove(existingSub);
    return { success: true, message: 'Inscrição cancelada com sucesso.' };
  }

  async getChampionshipSubscriptions(champId: string) {
    return this.subscriptionRepository.find({
      where: { modality: { championship: { id: champId } } },
      relations: [
        'modality',
        'team',
        'athlete',
        'athlete.user',
        'athletes',
        'athletes.user',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async updateSubscriptionStatus(subId: string, status: SubscriptionStatus) {
    if (!Object.values(SubscriptionStatus).includes(status)) {
      throw new BadRequestException('Status de inscrição inválido.');
    }

    const sub = await this.subscriptionRepository.findOne({
      where: { id: subId },
    });
    if (!sub) throw new NotFoundException('Inscrição não encontrada');

    sub.status = status;
    return this.subscriptionRepository.save(sub);
  }

  async updateSubscriptionPayment(subId: string, paymentStatus: string) {
    if (!['PENDING', 'PAID', 'FREE', 'REFUNDED'].includes(paymentStatus)) {
      throw new BadRequestException('Status de pagamento inválido.');
    }

    const sub = await this.subscriptionRepository.findOne({
      where: { id: subId },
    });
    if (!sub) throw new NotFoundException('Inscrição não encontrada');

    sub.paymentStatus = paymentStatus;
    return this.subscriptionRepository.save(sub);
  }
}
