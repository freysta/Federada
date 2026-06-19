import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../orders/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async register(registerDto: RegisterDto) {
    if (!registerDto.cpf || registerDto.cpf.trim() === '') {
      registerDto.cpf = null as any;
    }

    const emailExists = await this.usersRepository.findOne({ where: { email: registerDto.email } });
    if (emailExists) {
      throw new BadRequestException('Este e-mail já está cadastrado. Por favor, faça login.');
    }

    if (registerDto.cpf) {
      const cpfExists = await this.usersRepository.findOne({ where: { cpf: registerDto.cpf } });
      if (cpfExists) {
        throw new BadRequestException('Este CPF já está cadastrado.');
      }
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const verificationToken = crypto.randomUUID();

    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
      verificationToken,
    });

    await this.usersRepository.save(user);

    const storeUrl = process.env.STORE_URL || 'https://federada.com.br';
    const verificationLink = `${storeUrl}/verify-email?token=${verificationToken}`;

    this.mailerService.sendMail({
      to: user.email,
      subject: 'Bem-vindo(a) à Federada! Confirme seu e-mail',
      html: `
        <div style="font-family: monospace; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; overflow: hidden;">
          <div style="background-color: #000; padding: 30px; text-align: center;">
            <img src="${storeUrl}/urso-polar-andando.gif" alt="Urso" style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%; border: 2px solid white; margin-bottom: 10px;" />
            <h1 style="color: #fff; letter-spacing: 4px; margin: 0; font-size: 24px; text-transform: uppercase;">FEDERADA</h1>
          </div>
          <div style="padding: 40px 30px; background-color: #fff; color: #000;">
            <h2 style="margin-top: 0;">Bem-vindo(a), ${user.name}!</h2>
            <p>Sua conta na Federada foi criada com sucesso.</p>
            <p>Para ativar sua conta e fazer login, por favor confirme seu e-mail clicando no botão abaixo:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; display: inline-block;">Confirmar E-mail</a>
            </div>
            <p style="font-size: 12px; color: #666;">Se o botão não funcionar, copie e cole este link no navegador:<br/>${verificationLink}</p>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; color: #888; font-size: 10px; letter-spacing: 1px;">
            © 2026 FEDERADA. TODOS OS DIREITOS RESERVADOS.
          </div>
        </div>
      `,
    }).catch(e => console.error('Erro ao enviar email (configure o SMTP no .env):', e.message));

    // DEV MODE: Exibe o link no terminal do servidor para testes fáceis
    console.log('\n\n======================================================');
    console.log('🚨 MENSAGEM DO SISTEMA: VERIFICAÇÃO DE E-MAIL 🚨');
    console.log(`Para verificar a conta de ${user.email}, acesse o link:`);
    console.log(verificationLink);
    console.log('======================================================\n\n');

    return { message: 'Conta criada com sucesso! Verifique seu e-mail para acessar.' };
  }

  async verifyEmail(token: string) {
    const user = await this.usersRepository.findOne({ where: { verificationToken: token } });
    if (!user) {
      throw new BadRequestException('Token de verificação inválido ou expirado.');
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    await this.usersRepository.save(user);

    const payload = { email: user.email, sub: user.id, role: user.role };
    return { 
      message: 'E-mail verificado com sucesso! Você já pode fazer login.',
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  async fixUsers() {
    await this.usersRepository.update({}, { emailVerified: true });
    return { message: 'Usuários antigos atualizados com sucesso.' };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({ where: { email: loginDto.email } });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Por favor, verifique seu e-mail antes de fazer login. Cheque sua caixa de entrada ou spam.');
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

  async googleLogin(token: string) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      let user = await this.usersRepository.findOne({ where: { email: payload.email } });

      if (!user) {
        // Create user
        user = this.usersRepository.create({
          email: payload.email,
          name: payload.name || 'User',
          role: 'CUSTOMER',
          emailVerified: true,
          isActive: true
        });
        await this.usersRepository.save(user);
      } else {
        // If user exists but email is not verified, verify it since they logged in via Google
        if (!user.emailVerified) {
          user.emailVerified = true;
          await this.usersRepository.save(user);
        }
        
        if (!user.isActive) {
          throw new UnauthorizedException('Esta conta foi desativada pelo administrador.');
        }
      }

      const jwtPayload = { email: user.email, sub: user.id, role: user.role };
      return {
        access_token: this.jwtService.sign(jwtPayload),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Google login error:', error);
      throw new UnauthorizedException('Falha na autenticação com o Google');
    }
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
    if (!registerDto.cpf || registerDto.cpf.trim() === '') {
      registerDto.cpf = null;
    }

    const emailExists = await this.usersRepository.findOne({ where: { email: registerDto.email } });
    if (emailExists) {
      throw new BadRequestException('Este e-mail já está cadastrado.');
    }

    if (registerDto.cpf) {
      const cpfExists = await this.usersRepository.findOne({ where: { cpf: registerDto.cpf } });
      if (cpfExists) {
        throw new BadRequestException('Este CPF já está cadastrado.');
      }
    }

    const hashedPassword = await bcrypt.hash(registerDto.password || 'change_me_immediately', 10);

    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: registerDto.role || 'CUSTOMER',
      emailVerified: true,
    }) as any;

    await this.usersRepository.save(user);
    
    const storeUrl = process.env.STORE_URL || 'https://federada.com.br';
    
    this.mailerService.sendMail({
      to: user.email,
      subject: 'Sua conta de acesso foi criada!',
      html: `
        <div style="font-family: monospace; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; overflow: hidden;">
          <div style="background-color: #000; padding: 30px; text-align: center;">
            <img src="${storeUrl}/urso-polar-andando.gif" alt="Urso" style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%; border: 2px solid white; margin-bottom: 10px;" />
            <h1 style="color: #fff; letter-spacing: 4px; margin: 0; font-size: 24px; text-transform: uppercase;">FEDERADA</h1>
          </div>
          <div style="padding: 40px 30px; background-color: #fff; color: #000;">
            <h2 style="margin-top: 0;">Olá, ${user.name}</h2>
            <p>Sua conta administrativa com cargo <strong>${user.role}</strong> foi criada com sucesso.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${storeUrl}" style="background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; display: inline-block;">Acessar Plataforma</a>
            </div>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; color: #888; font-size: 10px; letter-spacing: 1px;">
            © 2026 FEDERADA. TODOS OS DIREITOS RESERVADOS.
          </div>
        </div>
      `,
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

    if (updateDto.cpf && updateDto.cpf.trim() !== '' && updateDto.cpf !== user.cpf) {
      const existingCpf = await this.usersRepository.findOne({ where: { cpf: updateDto.cpf } });
      if (existingCpf) throw new BadRequestException('CPF já está em uso');
      user.cpf = updateDto.cpf;
    } else if (updateDto.cpf !== undefined && updateDto.cpf.trim() === '') {
      user.cpf = null as any;
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

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new BadRequestException('User not found');
    await this.usersRepository.delete(id);
    return { message: 'Usuário excluído com sucesso' };
  }
}
