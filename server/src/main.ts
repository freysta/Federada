import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import helmet from 'helmet';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Headers
  // Helmet core (hsts, noSniff, frameguard, hidePoweredBy, etc.)
  app.use(
    helmet({
      // Prevent browsers from rendering the page in an <iframe> (Clickjacking)
      frameguard: { action: 'deny' },
      // Prevent MIME-type sniffing (e.g. uploading an HTML file disguised as image)
      noSniff: true,
      // Force HTTPS for 1 year in production
      hsts:
        process.env.NODE_ENV === 'production'
          ? { maxAge: 31536000, includeSubDomains: true, preload: true }
          : false,
      // Disable the X-Powered-By: Express header (no free info for attackers)
      hidePoweredBy: true,
      // Referrer information sent to external sites
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );
  app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

  // Payload Limits - 2mb is generous for JSON, 10mb was too permissive for DoS
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ limit: '2mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown fields automatically
      forbidNonWhitelisted: true, // Error on unknown fields
      transform: true, // Auto-cast types (e.g. string '"123"' to number)
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Enable CORS for Frontend communication
  app.enableCors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : [
          'https://federada.com.br:8443',
          'http://federada.com.br:8080',
          'http://localhost:5173',
        ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
