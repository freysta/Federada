import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Team } from './entities/team.entity';
import { AthleteProfile } from './entities/athlete-profile.entity';
import { AthleteAvailability } from './entities/athlete-availability.entity';
import { User } from '../orders/entities/user.entity';
import { Championship } from '../championships/entities/championship.entity';
import { FileStorageService } from '../storage/storage.service';

function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  const cpfArray = cpf.split('').map((el) => +el);
  const rest = (count: number) =>
    ((cpfArray
      .slice(0, count - 12)
      .reduce((soma, el, index) => soma + el * (count - index), 0) *
      10) %
      11) %
    10;
  return rest(10) === cpfArray[9] && rest(11) === cpfArray[10];
}

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(AthleteProfile)
    private athleteProfileRepository: Repository<AthleteProfile>,
    @InjectRepository(AthleteAvailability)
    private availabilityRepository: Repository<AthleteAvailability>,
    private fileStorageService: FileStorageService,
  ) {}

  async createTeam(
    userId: string,
    data: {
      name: string;
      university?: string;
      logoUrl?: string;
      cnpj?: string;
      city?: string;
      state?: string;
      instagram?: string;
    },
  ) {
    // Generate a simple invite code
    const inviteCode = `${data.name.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let team = this.teamRepository.create({
      ...data,
      owner: { id: userId } as User,
      inviteCode,
    });

    team = await this.teamRepository.save(team);

    // Create president profile automatically
    const athleteIdCode = `ATL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const profile = this.athleteProfileRepository.create({
      user: { id: userId } as User,
      team,
      teamRole: 'PRESIDENT',
      teamJoinStatus: 'APPROVED',
      athleteIdCode,
    });
    await this.athleteProfileRepository.save(profile);

    return team;
  }

  async createTeamByAdmin(
    data: {
      name: string;
      university?: string;
      logoUrl?: string;
      cnpj?: string;
      city?: string;
      state?: string;
      instagram?: string;
      ownerId: string;
    },
  ) {
    const inviteCode = `${data.name.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let team = this.teamRepository.create({
      ...data,
      owner: { id: data.ownerId } as User,
      inviteCode,
    });

    team = await this.teamRepository.save(team);

    let profile = await this.athleteProfileRepository.findOne({
      where: { user: { id: data.ownerId } },
    });

    if (!profile) {
      const athleteIdCode = `ATL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      profile = this.athleteProfileRepository.create({
        user: { id: data.ownerId } as User,
        team,
        teamRole: 'PRESIDENT',
        teamJoinStatus: 'APPROVED',
        athleteIdCode,
      });
    } else {
      profile.team = team;
      profile.teamRole = 'PRESIDENT';
      profile.teamJoinStatus = 'APPROVED';
    }
    await this.athleteProfileRepository.save(profile);

    return team;
  }

  async findAll() {
    return this.teamRepository.find({ relations: ['owner'] });
  }

  async findAllAdmin() {
    const teams = await this.teamRepository.find({ relations: ['owner'] });
    const result = [];
    for (const team of teams) {
      const athleteCount = await this.athleteProfileRepository.count({
        where: { team: { id: team.id }, teamJoinStatus: 'APPROVED' },
      });
      const presidentProfile = await this.athleteProfileRepository.findOne({
        where: { team: { id: team.id }, teamRole: 'PRESIDENT' },
        relations: ['user'],
      });
      result.push({
        ...team,
        athleteCount,
        president: presidentProfile?.user || team.owner || null,
      });
    }
    return result;
  }

  async updateTeamByAdmin(
    id: string,
    data: {
      name?: string;
      university?: string;
      logoUrl?: string;
      cnpj?: string;
      city?: string;
      state?: string;
      instagram?: string;
      ownerId?: string;
    },
  ) {
    const team = await this.teamRepository.findOne({ where: { id } });
    if (!team) throw new NotFoundException('Atlética não encontrada.');

    if (data.ownerId) {
      team.owner = { id: data.ownerId } as User;
      
      // Demote previous presidents of this team
      const oldPresidents = await this.athleteProfileRepository.find({
        where: { team: { id }, teamRole: 'PRESIDENT' },
        relations: ['user'],
      });
      for (const p of oldPresidents) {
        if (p.user.id !== data.ownerId) {
          p.teamRole = 'MEMBER';
          await this.athleteProfileRepository.save(p);
        }
      }

      // Promote or create new president profile
      let newOwnerProfile = await this.athleteProfileRepository.findOne({
        where: { user: { id: data.ownerId } },
      });

      if (!newOwnerProfile) {
        const athleteIdCode = `ATL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        newOwnerProfile = this.athleteProfileRepository.create({
          user: { id: data.ownerId } as User,
          team,
          teamRole: 'PRESIDENT',
          teamJoinStatus: 'APPROVED',
          athleteIdCode,
        });
      } else {
        newOwnerProfile.team = team;
        newOwnerProfile.teamRole = 'PRESIDENT';
        newOwnerProfile.teamJoinStatus = 'APPROVED';
      }
      await this.athleteProfileRepository.save(newOwnerProfile);
    }
    if (data.name) team.name = data.name;
    if (data.university !== undefined) team.university = data.university;
    if (data.logoUrl !== undefined) team.logoUrl = data.logoUrl;
    if (data.cnpj !== undefined) team.cnpj = data.cnpj;
    if (data.city !== undefined) team.city = data.city;
    if (data.state !== undefined) team.state = data.state;
    if (data.instagram !== undefined) team.instagram = data.instagram;

    return this.teamRepository.save(team);
  }

  async deleteTeamByAdmin(id: string) {
    const team = await this.teamRepository.findOne({ where: { id } });
    if (!team) throw new NotFoundException('Atlética não encontrada.');
    return this.teamRepository.remove(team);
  }

  async getInviteInfo(inviteCode: string) {
    const team = await this.teamRepository.findOne({ where: { inviteCode } });
    if (!team)
      throw new NotFoundException(
        'Código de convite inválido ou Atlética não encontrada.',
      );

    // Find president
    const presidentProfile = await this.athleteProfileRepository.findOne({
      where: { team: { id: team.id }, teamRole: 'PRESIDENT' },
      relations: ['user'],
    });

    return {
      teamName: team.name,
      teamLogo: team.logoUrl,
      presidentName: presidentProfile?.user?.name || 'O Presidente',
    };
  }

  async joinTeam(
    userId: string,
    inviteCode: string,
    data: {
      cpf: string;
      birthDate: Date;
      course?: string;
      period?: string;
      gender?: string;
    },
  ) {
    if (!validateCPF(data.cpf)) {
      throw new BadRequestException('CPF inválido.');
    }

    const team = await this.teamRepository.findOne({ where: { inviteCode } });
    if (!team) {
      throw new NotFoundException(
        'Código de convite inválido ou Atlética não encontrada.',
      );
    }

    // Check se outro usuário já usa esse CPF
    const existingCpf = await this.athleteProfileRepository.findOne({
      where: { cpf: data.cpf },
    });
    if (existingCpf) {
      throw new BadRequestException(
        'Este CPF já está em uso por outro atleta.',
      );
    }

    // Check if user already has a profile
    let profile = await this.athleteProfileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (profile) {
      throw new BadRequestException(
        'Você já possui um perfil de atleta. Para mudar de atlética, contate o administrador.',
      );
    }

    const athleteIdCode = `ATL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    profile = this.athleteProfileRepository.create({
      user: { id: userId } as User,
      team,
      cpf: data.cpf,
      course: data.course,
      period: data.period,
      birthDate: data.birthDate,
      gender: data.gender,
      athleteIdCode,
      teamRole: 'ATHLETE',
      teamJoinStatus: 'APPROVED', // Since they have the invite code, they are pre-approved
    });

    return this.athleteProfileRepository.save(profile);
  }

  async requestJoinTeam(
    userId: string,
    teamId: string,
    data: {
      cpf: string;
      birthDate: Date;
      course?: string;
      period?: string;
      gender?: string;
    },
  ) {
    if (!validateCPF(data.cpf)) {
      throw new BadRequestException('CPF inválido.');
    }

    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException('Atlética não encontrada.');
    }

    const existingCpf = await this.athleteProfileRepository.findOne({
      where: { cpf: data.cpf },
    });
    if (existingCpf) {
      throw new BadRequestException('Este CPF já está em uso por outro atleta.');
    }

    let profile = await this.athleteProfileRepository.findOne({
      where: { user: { id: userId } },
    });
    
    // Se o usuário já tiver perfil, mas sem equipe, podemos atualizar para adicionar a equipe?
    if (profile) {
      if (profile.team) {
        throw new BadRequestException('Você já está vinculado ou solicitou vínculo a uma atlética.');
      }
      
      // Update existing profile
      profile.team = team;
      profile.cpf = data.cpf;
      profile.course = data.course || profile.course;
      profile.period = data.period || profile.period;
      profile.birthDate = data.birthDate || profile.birthDate;
      profile.gender = data.gender || profile.gender;
      profile.teamRole = 'ATHLETE';
      profile.teamJoinStatus = 'PENDING';
      
      return this.athleteProfileRepository.save(profile);
    }

    const athleteIdCode = `ATL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    profile = this.athleteProfileRepository.create({
      user: { id: userId } as User,
      team,
      cpf: data.cpf,
      course: data.course,
      period: data.period,
      birthDate: data.birthDate,
      gender: data.gender,
      athleteIdCode,
      teamRole: 'ATHLETE',
      teamJoinStatus: 'PENDING',
    });

    return this.athleteProfileRepository.save(profile);
  }

  async getJoinRequests(userId: string) {
    const adminProfile = await this.athleteProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['team'],
    });

    if (!adminProfile || adminProfile.teamRole !== 'PRESIDENT' || !adminProfile.team) {
      throw new BadRequestException('Apenas o presidente da equipe pode visualizar solicitações.');
    }

    return this.athleteProfileRepository.find({
      where: {
        team: { id: adminProfile.team.id },
        teamJoinStatus: 'PENDING'
      },
      relations: ['user']
    });
  }

  async updateJoinStatus(userId: string, profileId: string, status: 'APPROVED' | 'REJECTED') {
    const adminProfile = await this.athleteProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['team'],
    });

    if (!adminProfile || adminProfile.teamRole !== 'PRESIDENT' || !adminProfile.team) {
      throw new BadRequestException('Apenas o presidente da equipe pode aprovar ou rejeitar solicitações.');
    }

    const profile = await this.athleteProfileRepository.findOne({
      where: { id: profileId },
      relations: ['team']
    });

    if (!profile) throw new NotFoundException('Perfil não encontrado.');
    if (!profile.team || profile.team.id !== adminProfile.team.id) {
      throw new BadRequestException('Este atleta não solicitou vínculo à sua equipe.');
    }

    profile.teamJoinStatus = status;
    
    // Se foi rejeitado, desvincula o time para o atleta poder solicitar outra
    if (status === 'REJECTED') {
      profile.team = null as any;
    }

    return this.athleteProfileRepository.save(profile);
  }

  async getTeamMembers(teamId: string) {
    return this.athleteProfileRepository.find({
      where: { team: { id: teamId } },
      relations: ['user'],
    });
  }

  async getMyProfile(userId: string) {
    return this.athleteProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['team', 'team.owner'],
    });
  }
  // ==== AVAILABILITY METHODS ====

  async setAvailability(
    userId: string,
    championshipId: string,
    isAvailable: boolean,
  ) {
    const profile = await this.athleteProfileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!profile) {
      throw new NotFoundException('Perfil de atleta não encontrado.');
    }

    let availability = await this.availabilityRepository.findOne({
      where: {
        athleteProfile: { id: profile.id },
        championship: { id: championshipId },
      },
    });

    if (!availability) {
      availability = this.availabilityRepository.create({
        athleteProfile: { id: profile.id } as AthleteProfile,
        championship: { id: championshipId } as Championship,
        status: isAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
      });
    } else {
      availability.status = isAvailable ? 'AVAILABLE' : 'UNAVAILABLE';
    }

    return this.availabilityRepository.save(availability);
  }

  async getAvailabilities(teamId: string, championshipId: string) {
    // Retorna todos os registros de disponibilidade para um campeonato específico de atletas de uma determinada equipe
    const profiles = await this.athleteProfileRepository.find({
      where: { team: { id: teamId } },
      select: ['id'],
    });

    if (profiles.length === 0) return [];

    const profileIds = profiles.map((p) => p.id);

    return this.availabilityRepository.find({
      where: {
        championship: { id: championshipId },
        athleteProfile: { id: In(profileIds) },
      },
      relations: ['athleteProfile'], // carrega o perfil do atleta
    });
  }

  async removeMemberFromMyTeam(userId: string, memberProfileId: string) {
    const adminProfile = await this.athleteProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['team'],
    });

    if (!adminProfile || adminProfile.teamRole !== 'PRESIDENT' || !adminProfile.team) {
      throw new BadRequestException('Apenas o presidente da equipe pode remover membros.');
    }

    const targetProfile = await this.athleteProfileRepository.findOne({
      where: { id: memberProfileId },
      relations: ['team']
    });

    if (!targetProfile) throw new NotFoundException('Perfil do membro não encontrado.');
    if (!targetProfile.team || targetProfile.team.id !== adminProfile.team.id) {
      throw new BadRequestException('Este atleta não pertence à sua equipe.');
    }

    if (targetProfile.teamRole === 'PRESIDENT') {
       throw new BadRequestException('Não é possível remover outro presidente diretamente. Rebaixe o cargo primeiro.');
    }

    targetProfile.team = null as any;
    targetProfile.teamJoinStatus = null as any;
    targetProfile.teamRole = 'ATHLETE';

    return this.athleteProfileRepository.save(targetProfile);
  }

  async updateMemberRole(userId: string, memberProfileId: string, newRole: 'PRESIDENT' | 'MEMBER') {
    const adminProfile = await this.athleteProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['team'],
    });

    if (!adminProfile || adminProfile.teamRole !== 'PRESIDENT' || !adminProfile.team) {
      throw new BadRequestException('Apenas o presidente da equipe pode alterar cargos.');
    }

    const targetProfile = await this.athleteProfileRepository.findOne({
      where: { id: memberProfileId },
      relations: ['team']
    });

    if (!targetProfile) throw new NotFoundException('Perfil do membro não encontrado.');
    if (!targetProfile.team || targetProfile.team.id !== adminProfile.team.id) {
      throw new BadRequestException('Este atleta não pertence à sua equipe.');
    }

    // Impede o presidente de rebaixar a si mesmo se ele for o único
    if (newRole === 'MEMBER' && targetProfile.id === adminProfile.id) {
      const allPresidents = await this.athleteProfileRepository.count({
        where: { team: { id: adminProfile.team.id }, teamRole: 'PRESIDENT' }
      });
      if (allPresidents <= 1) {
        throw new BadRequestException('Você não pode se rebaixar sendo o único presidente da equipe.');
      }
    }

    targetProfile.teamRole = newRole;
    return this.athleteProfileRepository.save(targetProfile);
  }

  async leaveTeam(userId: string) {
    const profile = await this.athleteProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['team'],
    });

    if (!profile) {
      throw new NotFoundException('Perfil de atleta não encontrado.');
    }

    if (profile.teamRole === 'PRESIDENT') {
      throw new BadRequestException(
        'O presidente não pode se desvincular da equipe. Transfira a presidência ou exclua a equipe.',
      );
    }

    profile.team = null as any;
    profile.teamJoinStatus = null as any;
    profile.teamRole = 'ATHLETE';

    return this.athleteProfileRepository.save(profile);
  }
}
