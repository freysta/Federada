import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersController } from './users.controller';
import { User } from '../orders/entities/user.entity';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const isProd = process.env.NODE_ENV === 'production';
        if (!secret) {
          if (isProd) {
            console.error(
              '❌ FATAL ERROR: JWT_SECRET is NOT set in production environment. Refusing to start.',
            );
            process.exit(1);
          }
          console.warn(
            '⚠️  WARNING: JWT_SECRET not set! Using development fallback. DO NOT use in production!',
          );
        }
        return {
          secret:
            secret ||
            'dev_fallback_xK9mP2vL7nQ4wR8jT5cF1bY3hA6gD0eZ_CHANGE_IN_PROD',
          signOptions: { expiresIn: '7d' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
