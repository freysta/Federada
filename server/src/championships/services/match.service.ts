import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../entities/match.entity';
import { Championship } from '../entities/championship.entity';
import { AthleteProfile } from '../../teams/entities/athlete-profile.entity';
import { Team } from '../../teams/entities/team.entity';
import { ChampionshipPermissionService } from './championship-permission.service';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Championship)
    private championshipRepository: Repository<Championship>,
    private permissionService: ChampionshipPermissionService,
  ) {}

  async getMatches(championshipId: string, modalityId: string) {
    return this.matchRepository.find({
      where: { modality: { id: modalityId } },
      relations: [
        'teamA',
        'teamB',
        'athleteA',
        'athleteB',
        'athleteA.user',
        'athleteB.user',
        'nextMatch',
      ],
      order: { round: 'ASC', bracketPosition: 'ASC', date: 'ASC' },
    });
  }

  async updateMatch(
    championshipId: string,
    modalityId: string,
    matchId: string,
    data: any,
    user: any,
  ) {
    const champ = await this.championshipRepository.findOne({
      where: { id: championshipId },
      relations: ['owner'],
    });
    if (!champ) throw new NotFoundException('Campeonato não encontrado.');
    this.permissionService.assertCanManage(champ, user);

    return this.matchRepository.manager.transaction(async (manager) => {
      const match = await manager.findOne(Match, {
        where: { id: matchId },
        relations: ['teamA', 'teamB', 'athleteA', 'athleteB', 'nextMatch'],
      });
      if (!match) throw new NotFoundException('Partida não encontrada.');

      // Update fields
      if (data.scoreA !== undefined) match.scoreA = data.scoreA;
      if (data.scoreB !== undefined) match.scoreB = data.scoreB;
      if (data.status) match.status = data.status;
      if (data.location !== undefined) match.location = data.location;
      if (data.date !== undefined) match.date = data.date;
      if (data.summaryFileUrl !== undefined)
        match.summaryFileUrl = data.summaryFileUrl;

      const savedMatch = await manager.save(match);

      // If match is finished and it's a knockout tournament, advance the winner to the next match
      if (savedMatch.status === 'FINISHED' && savedMatch.nextMatch) {
        if (savedMatch.scoreA === savedMatch.scoreB) {
          throw new BadRequestException(
            'Partidas eliminatórias não podem terminar em empate.',
          );
        }

        const nextMatch = await manager.findOne(Match, {
          where: { id: savedMatch.nextMatch.id },
          relations: ['teamA', 'teamB', 'athleteA', 'athleteB'],
        });
        if (nextMatch) {
          // Determine winner
          const winnerTeam =
            savedMatch.scoreA > savedMatch.scoreB
              ? savedMatch.teamA
              : savedMatch.teamB;
          const winnerAthlete =
            savedMatch.scoreA > savedMatch.scoreB
              ? savedMatch.athleteA
              : savedMatch.athleteB;

          // Next match could be waiting for teamA or teamB
          if (!nextMatch.teamA && !nextMatch.athleteA) {
            nextMatch.teamA = winnerTeam;
            nextMatch.athleteA = winnerAthlete;
          } else {
            nextMatch.teamB = winnerTeam;
            nextMatch.athleteB = winnerAthlete;
          }
          await manager.save(nextMatch);
        }
      }

      return savedMatch;
    });
  }

  async getStandings(
    championshipId: string,
    modalityId: string,
    group?: string,
  ) {
    // Busca as partidas finalizadas
    const where: any = { modality: { id: modalityId }, status: 'FINISHED' };
    if (group) where.group = group;

    const matches = await this.matchRepository.find({
      where,
      relations: [
        'teamA',
        'teamB',
        'athleteA',
        'athleteB',
        'athleteA.user',
        'athleteB.user',
      ],
    });

    // Calcula a classificação
    const standings = new Map<string, any>();

    const getParticipantKey = (team: Team, athlete: AthleteProfile) => {
      if (team) return `team_${team.id}`;
      if (athlete) return `athlete_${athlete.id}`;
      return null;
    };

    const initParticipant = (team: Team, athlete: AthleteProfile) => {
      const key = getParticipantKey(team, athlete);
      if (!key || standings.has(key)) return;

      standings.set(key, {
        id: team ? team.id : athlete.id,
        name: team ? team.name : athlete.user.name,
        avatar: team ? team.logoUrl : null,
        type: team ? 'TEAM' : 'ATHLETE',
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
      });
    };

    matches.forEach((match) => {
      if (!match.teamA && !match.athleteA) return;
      if (!match.teamB && !match.athleteB) return;

      initParticipant(match.teamA, match.athleteA);
      initParticipant(match.teamB, match.athleteB);

      const keyA = getParticipantKey(match.teamA, match.athleteA);
      const keyB = getParticipantKey(match.teamB, match.athleteB);
      if (!keyA || !keyB) return;
      const pA = standings.get(keyA);
      const pB = standings.get(keyB);

      // Atualiza gols/pontos feitos e sofridos
      pA.goalsFor += match.scoreA || 0;
      pA.goalsAgainst += match.scoreB || 0;
      pB.goalsFor += match.scoreB || 0;
      pB.goalsAgainst += match.scoreA || 0;

      pA.matches += 1;
      pB.matches += 1;

      // Vitória A
      if ((match.scoreA || 0) > (match.scoreB || 0)) {
        pA.wins += 1;
        pA.points += 3;
        pB.losses += 1;
      }
      // Vitória B
      else if ((match.scoreB || 0) > (match.scoreA || 0)) {
        pB.wins += 1;
        pB.points += 3;
        pA.losses += 1;
      }
      // Empate
      else {
        pA.draws += 1;
        pA.points += 1;
        pB.draws += 1;
        pB.points += 1;
      }

      pA.goalDifference = pA.goalsFor - pA.goalsAgainst;
      pB.goalDifference = pB.goalsFor - pB.goalsAgainst;
    });

    const result = Array.from(standings.values());
    result.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.goalDifference - a.goalDifference;
    });

    return result;
  }
}
