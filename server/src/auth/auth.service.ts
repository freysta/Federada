import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../orders/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async register(registerDto: RegisterDto) {
    const whereConditions: any[] = [{ email: registerDto.email }];
    if (registerDto.cpf) {
      whereConditions.push({ cpf: registerDto.cpf });
    }

    const existingUser = await this.usersRepository.findOne({
      where: whereConditions
    });

    if (existingUser) {
      throw new BadRequestException('User with this email or CPF already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    await this.usersRepository.save(user);

    this.mailerService.sendMail({
      to: user.email,
      subject: 'Bem-vindo(a) à Federada!',
      text: `Olá ${user.name},\n\nSua conta na Federada foi criada com sucesso!\n\nAcesse nossa loja: https://federada.com.br\n\nAbraços,\nEquipe Federada`,
    }).catch(e => console.error('Erro ao enviar email:', e));

    return this.login({ email: user.email, password: registerDto.password! });
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({ where: { email: loginDto.email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Esta conta foi desativada pelo administrador.');
    }

    if (!user.password) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password || '', user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  async findAllUsers() {
    return this.usersRepository.find({
      select: ['id', 'name', 'email', 'cpf', 'phone', 'role', 'userType', 'period', 'isActive', 'createdAt'],
      order: { createdAt: 'DESC' }
    });
  }

  async promoteToAdmin(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    user.role = 'ADMIN';
    await this.usersRepository.save(user);
    return { message: 'User promoted to ADMIN successfully', user: { id: user.id, name: user.name, role: user.role } };
  }

  async createAdminUser(registerDto: any) {
    const whereConditions: any[] = [{ email: registerDto.email }];
    if (registerDto.cpf) {
      whereConditions.push({ cpf: registerDto.cpf });
    }

    const existingUser = await this.usersRepository.findOne({
      where: whereConditions
    });

    if (existingUser) {
      throw new BadRequestException('User with this email or CPF already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password || 'change_me_immediately', 10);

    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: registerDto.role || 'CUSTOMER',
    }) as any;

    await this.usersRepository.save(user);
    
    this.mailerService.sendMail({
      to: user.email,
      subject: 'Sua conta de acesso foi criada!',
      text: `Olá ${user.name},\n\nSua conta com cargo ${user.role} foi criada na plataforma Federada.\nAcesse: https://federada.com.br\n\nAbraços,\nEquipe Federada`,
    }).catch(e => console.error('Erro ao enviar email:', e));
    
    return { message: 'Usuário criado', user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password || '');
    if (!isPasswordValid) throw new BadRequestException('Senha atual incorreta');

    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.save(user);

    return { message: 'Senha alterada com sucesso' };
  }

  async updateProfile(userId: string, updateDto: any) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    if (updateDto.name) user.name = updateDto.name;
    if (updateDto.phone !== undefined) user.phone = updateDto.phone;
    if (updateDto.userType) user.userType = updateDto.userType;
    if (updateDto.period !== undefined) user.period = updateDto.period;

    await this.usersRepository.save(user);
    return { message: 'Perfil atualizado', user: { id: user.id, name: user.name, role: user.role } };
  }

  async updateUserByAdmin(id: string, updateDto: any) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new BadRequestException('User not found');

    if (updateDto.email && updateDto.email !== user.email) {
      const existingEmail = await this.usersRepository.findOne({ where: { email: updateDto.email } });
      if (existingEmail) throw new BadRequestException('E-mail já está em uso');
      user.email = updateDto.email;
    }

    if (updateDto.cpf && updateDto.cpf !== user.cpf) {
      const existingCpf = await this.usersRepository.findOne({ where: { cpf: updateDto.cpf } });
      if (existingCpf) throw new BadRequestException('CPF já está em uso');
      user.cpf = updateDto.cpf;
    }

    if (updateDto.name) user.name = updateDto.name;
    if (updateDto.phone !== undefined) user.phone = updateDto.phone;
    if (updateDto.role) user.role = updateDto.role;
    if (updateDto.userType) user.userType = updateDto.userType;
    if (updateDto.period !== undefined) user.period = updateDto.period;
    if (updateDto.isActive !== undefined) user.isActive = updateDto.isActive;

    if (updateDto.password) {
      user.password = await bcrypt.hash(updateDto.password, 10);
    }

    await this.usersRepository.save(user);
    return { message: 'Usuário atualizado com sucesso' };
  }
}
