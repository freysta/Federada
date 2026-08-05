import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './orders/entities/user.entity';
import {
  Championship,
  ChampionshipStatus,
} from './championships/entities/championship.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const championshipRepository = app.get<Repository<Championship>>(
    getRepositoryToken(Championship),
  );

  console.log('🌱 Iniciando Seed...');

  // Criar ADMIN
  const adminEmail = 'admin@federada.com';
  let admin = await userRepository.findOne({ where: { email: adminEmail } });
  if (!admin) {
    admin = userRepository.create({
      name: 'Super Admin',
      email: adminEmail,
      password: await bcrypt.hash('123456', 10),
      role: 'ADMIN',
      emailVerified: true,
      isActive: true,
    });
    await userRepository.save(admin);
    console.log('✅ Admin criado:', adminEmail, '/ 123456');
  } else {
    console.log('ℹ️ Admin já existe.');
  }

  // Criar SPORTS_ADMIN (Organizador)
  const sportsAdminEmail = 'organizador@federada.com';
  let sportsAdmin = await userRepository.findOne({
    where: { email: sportsAdminEmail },
  });
  if (!sportsAdmin) {
    sportsAdmin = userRepository.create({
      name: 'Organizador de Campeonatos',
      email: sportsAdminEmail,
      password: await bcrypt.hash('123456', 10),
      role: 'SPORTS_ADMIN',
      emailVerified: true,
      isActive: true,
    });
    await userRepository.save(sportsAdmin);
    console.log('✅ Organizador criado:', sportsAdminEmail, '/ 123456');
  } else {
    console.log('ℹ️ Organizador já existe.');
  }

  // Criar ATHLETE (Atleta)
  const athleteEmail = 'atleta@federada.com';
  let athlete = await userRepository.findOne({
    where: { email: athleteEmail },
  });
  if (!athlete) {
    athlete = userRepository.create({
      name: 'Atleta Teste',
      email: athleteEmail,
      password: await bcrypt.hash('123456', 10),
      role: 'ATHLETE',
      emailVerified: true,
      isActive: true,
    });
    await userRepository.save(athlete);
    console.log('✅ Atleta criado:', athleteEmail, '/ 123456');
  } else {
    console.log('ℹ️ Atleta já existe.');
  }

  // Criar um campeonato inicial para o Organizador
  const existingChamp = await championshipRepository.findOne({
    where: { owner: { id: sportsAdmin.id } },
    relations: ['owner'],
  });
  if (!existingChamp) {
    const champ = championshipRepository.create({
      name: 'Campeonato de Seed',
      description: 'Campeonato gerado automaticamente pelo seed.',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-10'),
      status: ChampionshipStatus.DRAFT,
      owner: sportsAdmin,
    });
    await championshipRepository.save(champ);
    console.log('✅ Campeonato de Seed criado.');
  } else {
    console.log('ℹ️ Campeonato já existe.');
  }

  await app.close();
  console.log('🎉 Seed finalizado com sucesso!');
}

bootstrap().catch((err) => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});
