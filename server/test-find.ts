import { DataSource } from 'typeorm';
import { Championship } from './src/championships/entities/championship.entity';
import { Modality } from './src/championships/entities/modality.entity';
import { User } from './src/orders/entities/user.entity';

async function test() {
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'password', // check if this matches
    database: 'federada', // check if this matches
    entities: [Championship, Modality, User],
    synchronize: false,
  });

  await AppDataSource.initialize();
  
  const repo = AppDataSource.getRepository(Championship);
  
  try {
    const champs = await repo.find({
      where: { owner: { id: 'some-uuid' } },
      relations: ['modalities', 'owner']
    });
    console.log('SUCCESS', champs);
  } catch (e) {
    console.error('ERROR', e);
  }
  
  await AppDataSource.destroy();
}

test();
