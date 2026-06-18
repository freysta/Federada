import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { User } from './orders/entities/user.entity';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CmsModule } from './cms/cms.module';
import { TeamMember } from './cms/entities/team-member.entity';
import { News } from './cms/entities/news.entity';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads/',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // 100 requests per minute per IP
    }]),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST') || 'smtp.gmail.com',
          port: Number(configService.get('SMTP_PORT')) || 587,
          secure: configService.get('SMTP_SECURE') === 'true',
          auth: {
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_PASS'),
          },
        },
        defaults: {
          from: `"Federada" <${configService.get('SMTP_USER')}>`,
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL');
        if (dbUrl) {
          // Use PostgreSQL se a URL existir
          return {
            type: 'postgres',
            url: dbUrl,
            entities: [Order, OrderItem, User, Product, TeamMember, News],
            synchronize: process.env.NODE_ENV !== 'production',
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
          };
        }
        // Fallback para SQLite em ambiente de dev local (sem URL de banco)
        return {
          type: 'sqlite',
          database: 'data/database.sqlite',
          entities: [Order, OrderItem, User, Product, TeamMember, News],
          synchronize: true,
        };
      },
    }),
    OrdersModule,
    ProductsModule,
    AuthModule,
    CmsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}
