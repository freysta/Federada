import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Championship } from './championships/entities/championship.entity';
import { Modality } from './championships/entities/modality.entity';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const championshipRepo = app.get<Repository<Championship>>(getRepositoryToken(Championship));
  const modalityRepo = app.get<Repository<Modality>>(getRepositoryToken(Modality));

  console.log('Seeding Database...');

  // Create Championship
  const champ = championshipRepo.create({
    name: 'Inter-Atléticas 2026',
    description: 'O maior torneio do estado. Inscreva-se agora e represente sua equipe.',
    startDate: new Date('2026-08-01'),
    endDate: new Date('2026-08-15'),
    status: 'OPEN',
  });
  await championshipRepo.save(champ);

  // Create Modalities
  const modalities = [
    { name: 'Futsal', type: 'Masculino', price: 0, championship: champ },
    { name: 'Futsal', type: 'Feminino', price: 0, championship: champ },
    { name: 'Vôlei', type: 'Masculino', price: 0, championship: champ },
    { name: 'Vôlei', type: 'Feminino', price: 0, championship: champ },
    { name: 'Basquete', type: 'Misto', price: 15.00, championship: champ },
  ];

  for (const m of modalities) {
    const mod = modalityRepo.create(m);
    await modalityRepo.save(mod);
  }

  console.log('Seeding Complete!');
  await app.close();
}

bootstrap().catch(console.error);
