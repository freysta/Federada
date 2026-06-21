import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { AthleteProfile } from './entities/athlete-profile.entity';
import { User } from '../orders/entities/user.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(AthleteProfile)
    private athleteProfileRepository: Repository<AthleteProfile>,
  ) {}

  async createTeam(userId: string, data: { name: string; university?: string; logoUrl?: string }) {
    // Generate a simple invite code
    const inviteCode = `${data.name.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const team = this.teamRepository.create({
      ...data,
      owner: { id: userId } as User,
      inviteCode,
    });
    
    return this.teamRepository.save(team);
  }

  async findAll() {
    return this.teamRepository.find({ relations: ['owner'] });
  }

  async joinTeam(userId: string, inviteCode: string, data: { cpf: string; birthDate: Date; enrollmentProofUrl?: string }) {
    const team = await this.teamRepository.findOne({ where: { inviteCode } });
    if (!team) {
      throw new NotFoundException('Código de convite inválido ou Atlética não encontrada.');
    }

    // Check if user already has a profile
    let profile = await this.athleteProfileRepository.findOne({ where: { user: { id: userId } } });
    if (profile) {
      throw new BadRequestException('Você já possui um perfil de atleta. Para mudar de atlética, contate o administrador.');
    }

    profile = this.athleteProfileRepository.create({
      user: { id: userId } as User,
      team,
      birthDate: data.birthDate,
      enrollmentProofUrl: data.enrollmentProofUrl,
    });

    return this.athleteProfileRepository.save(profile);
  }

  async getTeamMembers(teamId: string) {
    return this.athleteProfileRepository.find({
      where: { team: { id: teamId } },
      relations: ['user'],
    });
  }
}
