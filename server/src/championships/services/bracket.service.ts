import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Match } from '../entities/match.entity';
import { Championship } from '../entities/championship.entity';
import { Modality } from '../entities/modality.entity';
import { Subscription } from '../entities/subscription.entity';
import { BracketFormat, GenerateBracketDto } from '../dto/generate-bracket.dto';
import { SubscriptionStatus } from '../entities/subscription.entity';
import { ChampionshipPermissionService } from './championship-permission.service';

@Injectable()
export class BracketService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Championship)
    private championshipRepository: Repository<Championship>,
    @InjectRepository(Modality)
    private modalityRepository: Repository<Modality>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private permissionService: ChampionshipPermissionService,
  ) {}

  async generateBracket(
    championshipId: string,
    modalityId: string,
    dto: GenerateBracketDto,
    user: any,
  ) {
    const champ = await this.championshipRepository.findOne({
      where: { id: championshipId },
      relations: ['owner'],
    });
    if (!champ) throw new NotFoundException('Campeonato não encontrado.');
    this.permissionService.assertCanManage(champ, user);

    const modality = await this.modalityRepository.findOne({
      where: { id: modalityId },
    });
    if (!modality) throw new NotFoundException('Modalidade não encontrada.');

    const subscriptions = await this.subscriptionRepository.find({
      where: {
        modality: { id: modalityId },
        status: SubscriptionStatus.CONFIRMED,
      },
      relations: ['team', 'athlete'],
    });

    if (subscriptions.length < 2) {
      throw new BadRequestException(
        'Não há inscritos confirmados suficientes para gerar chaves.',
      );
    }

    await this.matchRepository.delete({ modality: { id: modalityId } });

    const participants = subscriptions.sort(() => Math.random() - 0.5);

    if (dto.format === BracketFormat.SINGLE_ELIMINATION) {
      await this.generateSingleElimination(modality, participants);
    } else if (dto.format === BracketFormat.ROUND_ROBIN) {
      await this.generateRoundRobin(modality, participants);
    } else {
      throw new BadRequestException(
        'Formato de chave não suportado ou em desenvolvimento.',
      );
    }

    return { message: 'Chaves geradas com sucesso.' };
  }

  private async generateSingleElimination(
    modality: Modality,
    subscriptions: Subscription[],
  ) {
    const numParticipants = subscriptions.length;
    const numRounds = Math.ceil(Math.log2(numParticipants));
    const bracketSize = Math.pow(2, numRounds);

    const currentRoundMatches: Match[] = [];

    for (let i = 0; i < bracketSize / 2; i++) {
      const p1 = subscriptions[i * 2];
      const p2 = subscriptions[i * 2 + 1];

      const match = this.matchRepository.create({
        modality,
        teamA: p1?.team || null,
        athleteA: p1?.athlete || null,
        teamB: p2?.team || null,
        athleteB: p2?.athlete || null,
        round: 1,
        bracketPosition: i + 1,
        status: p1 && !p2 ? 'FINISHED' : 'SCHEDULED', // Bye if no p2
        scoreA: p1 && !p2 ? 1 : null,
        scoreB: p1 && !p2 ? 0 : null,
        phase: 'KNOCKOUT',
      } as DeepPartial<Match>);
      const saved = await this.matchRepository.save(match);
      currentRoundMatches.push(saved);
    }

    let previousRoundMatches = currentRoundMatches;
    for (let round = 2; round <= numRounds; round++) {
      const nextRoundMatches: Match[] = [];
      const numMatchesInRound = bracketSize / Math.pow(2, round);

      for (let i = 0; i < numMatchesInRound; i++) {
        const match = this.matchRepository.create({
          modality,
          round,
          bracketPosition: i + 1,
          status: 'SCHEDULED',
          phase: 'KNOCKOUT',
        } as DeepPartial<Match>);
        const saved = await this.matchRepository.save(match);
        nextRoundMatches.push(saved);

        const m1 = previousRoundMatches[i * 2];
        const m2 = previousRoundMatches[i * 2 + 1];
        if (m1) {
          m1.nextMatch = saved;
          await this.matchRepository.save(m1);
          if (m1.status === 'FINISHED') {
            const isAWinner = (m1.scoreA ?? 0) >= (m1.scoreB ?? 0);
            saved.teamA = isAWinner ? m1.teamA : m1.teamB;
            saved.athleteA = isAWinner ? m1.athleteA : m1.athleteB;
          }
        }
        if (m2) {
          m2.nextMatch = saved;
          await this.matchRepository.save(m2);
          if (m2.status === 'FINISHED') {
            const isAWinner = (m2.scoreA ?? 0) >= (m2.scoreB ?? 0);
            saved.teamB = isAWinner ? m2.teamA : m2.teamB;
            saved.athleteB = isAWinner ? m2.athleteA : m2.athleteB;
          }
        }

        // Save the next round match again if we populated bye winners
        if (m1?.status === 'FINISHED' || m2?.status === 'FINISHED') {
          await this.matchRepository.save(saved);
        }
      }
      previousRoundMatches = nextRoundMatches;
    }
  }

  private async generateRoundRobin(
    modality: Modality,
    subscriptions: Subscription[],
  ) {
    const participants: (Subscription | null)[] = [...subscriptions];
    if (participants.length % 2 !== 0) {
      participants.push(null);
    }

    const numRounds = participants.length - 1;
    const halfSize = participants.length / 2;

    for (let round = 0; round < numRounds; round++) {
      for (let i = 0; i < halfSize; i++) {
        const p1 = participants[i];
        const p2 = participants[participants.length - 1 - i];

        if (p1 && p2) {
          const match = this.matchRepository.create({
            modality,
            teamA: p1.team || null,
            athleteA: p1.athlete || null,
            teamB: p2.team || null,
            athleteB: p2.athlete || null,
            round: round + 1,
            status: 'SCHEDULED',
            phase: 'ROUND_ROBIN',
          } as DeepPartial<Match>);
          await this.matchRepository.save(match);
        }
      }
      const last = participants.pop();
      participants.splice(1, 0, last || null);
    }
  }
}
