import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Championship } from './entities/championship.entity';
import { Modality } from './entities/modality.entity';
import { Subscription } from './entities/subscription.entity';
import { AthleteProfile } from '../teams/entities/athlete-profile.entity';
import { Team } from '../teams/entities/team.entity';

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
  ) {}

  async findAll() {
    return this.championshipRepository.find({ relations: ['modalities'] });
  }

  async findOne(id: string) {
    const champ = await this.championshipRepository.findOne({
      where: { id },
      relations: ['modalities'],
    });
    if (!champ) throw new NotFoundException('Campeonato não encontrado.');
    return champ;
  }

  async subscribeAthlete(userId: string, modalityId: string) {
    const profile = await this.athleteProfileRepository.findOne({ where: { user: { id: userId } }, relations: ['team'] });
    if (!profile) {
      throw new BadRequestException('Você precisa criar ou entrar em uma Atlética primeiro (Perfil de Atleta).');
    }

    const modality = await this.modalityRepository.findOne({ where: { id: modalityId } });
    if (!modality) {
      throw new NotFoundException('Modalidade não encontrada.');
    }

    // Check if already subscribed
    const existingSub = await this.subscriptionRepository.findOne({
      where: { athlete: { id: profile.id }, modality: { id: modalityId } }
    });

    if (existingSub) {
      throw new BadRequestException('Você já está inscrito nesta modalidade.');
    }

    const sub = this.subscriptionRepository.create({
      athlete: profile,
      team: profile.team,
      modality,
      paymentStatus: modality.price > 0 ? 'PENDING' : 'FREE',
    });

    return this.subscriptionRepository.save(sub);
  }

  async getMySubscriptions(userId: string) {
    const profile = await this.athleteProfileRepository.findOne({ where: { user: { id: userId } } });
    if (!profile) return [];

    return this.subscriptionRepository.find({
      where: { athlete: { id: profile.id } },
      relations: ['modality', 'championship'],
    });
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
}
