import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { AthleteProfile } from './entities/athlete-profile.entity';
import { User } from '../orders/entities/user.entity';
import { FileStorageService } from '../storage/storage.service';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(AthleteProfile)
    private athleteProfileRepository: Repository<AthleteProfile>,
    private fileStorageService: FileStorageService,
  ) {}

  async createTeam(userId: string, data: { name: string; university?: string; logoUrl?: string }) {
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
      athleteIdCode,
    });
    await this.athleteProfileRepository.save(profile);

    return team;
  }

  async findAll() {
    return this.teamRepository.find({ relations: ['owner'] });
  }

  async joinTeam(userId: string, inviteCode: string, data: { cpf: string; birthDate: Date; course?: string; period?: string }) {
    const team = await this.teamRepository.findOne({ where: { inviteCode } });
    if (!team) {
      throw new NotFoundException('Código de convite inválido ou Atlética não encontrada.');
    }

    // Check if user already has a profile
    let profile = await this.athleteProfileRepository.findOne({ where: { user: { id: userId } } });
    if (profile) {
      throw new BadRequestException('Você já possui um perfil de atleta. Para mudar de atlética, contate o administrador.');
    }

    const athleteIdCode = `ATL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    profile = this.athleteProfileRepository.create({
      user: { id: userId } as User,
      team,
      cpf: data.cpf,
      course: data.course,
      period: data.period,
      birthDate: data.birthDate,
      athleteIdCode,
      teamRole: 'ATHLETE',
    });

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

  async uploadDocument(userId: string, type: 'rg' | 'enrollment', file: Express.Multer.File) {
    const profile = await this.athleteProfileRepository.findOne({ where: { user: { id: userId } } });
    if (!profile) {
      throw new NotFoundException('Perfil de atleta não encontrado.');
    }

    const fileUrl = await this.fileStorageService.uploadFile(file, 'documents');

    if (type === 'rg') {
      profile.documentRgUrl = fileUrl;
      profile.documentRgStatus = 'PENDING';
    } else if (type === 'enrollment') {
      profile.documentEnrollmentUrl = fileUrl;
      profile.documentEnrollmentStatus = 'PENDING';
    }

    return this.athleteProfileRepository.save(profile);
  }

  async getPendingDocuments() {
    return this.athleteProfileRepository.find({
      where: [
        { documentRgStatus: 'PENDING' },
        { documentEnrollmentStatus: 'PENDING' }
      ],
      relations: ['user', 'team']
    });
  }

  async updateDocumentStatus(profileId: string, data: { type: 'rg' | 'enrollment'; status: 'APPROVED' | 'REJECTED' }) {
    const profile = await this.athleteProfileRepository.findOne({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Perfil não encontrado');

    if (data.type === 'rg') {
      profile.documentRgStatus = data.status;
    } else {
      profile.documentEnrollmentStatus = data.status;
    }

    // Auto-update overall status
    if (profile.documentRgStatus === 'APPROVED' && profile.documentEnrollmentStatus === 'APPROVED') {
      profile.status = 'APPROVED';
    } else if (profile.documentRgStatus === 'REJECTED' || profile.documentEnrollmentStatus === 'REJECTED') {
      profile.status = 'REJECTED';
    }

    return this.athleteProfileRepository.save(profile);
  }
}
