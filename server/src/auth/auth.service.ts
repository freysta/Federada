import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../orders/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: [{ email: registerDto.email }, { cpf: registerDto.cpf }]
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

    return this.login({ email: user.email, password: registerDto.password! });
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({ where: { email: loginDto.email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
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
      select: ['id', 'name', 'email', 'cpf', 'phone', 'role', 'createdAt'],
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
    const existingUser = await this.usersRepository.findOne({
      where: [{ email: registerDto.email }, { cpf: registerDto.cpf }]
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
    return { message: 'Usuário criado', user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
}
