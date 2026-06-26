import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { AthleteProfile } from './entities/athlete-profile.entity';
import { User } from '../orders/entities/user.entity';
import { FileStorageService } from '../storage/storage.service';

function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  const cpfArray = cpf.split('').map(el => +el);
  const rest = (count: number) => (cpfArray.slice(0, count - 12).reduce((soma, el, index) => (soma + el * (count - index)), 0) * 10) % 11 % 10;
  return rest(10) === cpfArray[9] && rest(11) === cpfArray[10];
}

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

  async joinTeam(userId: string, inviteCode: string, data: { cpf: string; birthDate: Date; course?: string; period?: string; gender?: string }) {
    if (!validateCPF(data.cpf)) {
      throw new BadRequestException('CPF inválido.');
    }

    const team = await this.teamRepository.findOne({ where: { inviteCode } });
    if (!team) {
      throw new NotFoundException('Código de convite inválido ou Atlética não encontrada.');
    }

    // Check se outro usuário já usa esse CPF
    const existingCpf = await this.athleteProfileRepository.findOne({ where: { cpf: data.cpf } });
    if (existingCpf) {
      throw new BadRequestException('Este CPF já está em uso por outro atleta.');
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
      gender: data.gender,
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

    await this.athleteProfileRepository.save(profile);
    return this.getMyProfile(userId);
  }

  async getPendingDocuments() {
    // Retorna todos para que o frontend possa agrupar por atlética e mostrar totais
    return this.athleteProfileRepository.find({
      relations: ['user', 'team']
    });
  }

  async updateDocumentStatus(profileId: string, data: { type: 'rg' | 'enrollment'; status: 'APPROVED' | 'REJECTED'; rejectionReason?: string }) {
    const profile = await this.athleteProfileRepository.findOne({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Perfil não encontrado');

    if (data.type === 'rg') {
      profile.documentRgStatus = data.status;
      if (data.status === 'REJECTED') profile.documentRgRejectionReason = data.rejectionReason || null;
      if (data.status === 'APPROVED') profile.documentRgRejectionReason = null;
    } else {
      profile.documentEnrollmentStatus = data.status;
      if (data.status === 'REJECTED') profile.documentEnrollmentRejectionReason = data.rejectionReason || null;
      if (data.status === 'APPROVED') profile.documentEnrollmentRejectionReason = null;
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
