import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User } from './orders/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const userRepository = dataSource.getRepository(User);

  console.log('Seeding role testing users...');

  const usersToSeed = [
    { email: 'superadmin@federada.com', role: 'ADMIN', name: 'Super Admin' },
    { email: 'loja@federada.com', role: 'STORE_ADMIN', name: 'Gerente da Loja' },
    { email: 'esportes@federada.com', role: 'SPORTS_ADMIN', name: 'Organizador Esportivo' },
    { email: 'atleta@federada.com', role: 'CUSTOMER', name: 'Atleta Teste' },
  ];

  const hashedPassword = await bcrypt.hash('123456', 10);

  for (const u of usersToSeed) {
    const existing = await userRepository.findOne({ where: { email: u.email } });
    if (!existing) {
      const user = userRepository.create({
        ...u,
        password: hashedPassword,
        emailVerified: true,
      });
      await userRepository.save(user);
      console.log(`Created user: ${u.email} with role ${u.role}`);
    } else {
      console.log(`User ${u.email} already exists.`);
      // Update role just in case
      existing.role = u.role;
      existing.password = hashedPassword;
      await userRepository.save(existing);
    }
  }

  console.log('Seed completed. Passwords are "123456"');
  await app.close();
}

bootstrap().catch(console.error);
