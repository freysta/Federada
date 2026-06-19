import { DataSource } from 'typeorm';
import { Product } from './products/entities/product.entity';
import { User } from './orders/entities/user.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { TeamMember } from './cms/entities/team-member.entity';
import { News } from './cms/entities/news.entity';
import * as bcrypt from 'bcrypt';

const dbUrl = process.env.DATABASE_URL;

const dataSource = new DataSource(
  dbUrl
    ? {
        type: 'postgres',
        url: dbUrl,
        entities: [Product, User, Order, OrderItem, TeamMember, News],
        synchronize: true,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      }
    : {
        type: 'sqlite',
        database: 'data/database.sqlite',
        entities: [Product, User, Order, OrderItem, TeamMember, News],
        synchronize: true,
      }
);

async function run() {
  await dataSource.initialize();
  
  const productRepo = dataSource.getRepository(Product);

  const existingProducts = await productRepo.count();
  if (existingProducts === 0) {
    console.log('Seeding products...');
    await productRepo.save([
      {
        name: 'CAMISA DRY-FIT FEDERADA',
        description: 'Tecido Dry-Fit Tecnológico, Cor: Azul Oficial',
        price: 69.90,
        imageUrl: '/uploads/merchs/camisas/camiseta-federada-v2.jpg',
        sizes: ['P', 'M', 'G', 'GG'],
      },
      {
        name: 'CAMISA DRY-FIT ADS',
        description: 'Malha Esportiva Premium, Cor: Preta',
        price: 69.90,
        imageUrl: '/uploads/merchs/camisas/camiseta-ads-v1.jpg',
        sizes: ['P', 'M', 'G', 'GG'],
      },
      {
        name: 'CAMISA OFICIAL ATLÉTICA',
        description: 'Tecido Leve e Respirável, Design Minimalista',
        price: 59.90,
        imageUrl: '/uploads/merchs/camisas/camiseta-atletica-v1-front.jpg',
        sizes: ['P', 'M', 'G', 'GG'],
      },
      {
        name: 'CANECA TÉRMICA FEDERADA',
        description: 'Cerâmica de Alta Qualidade, 350ml',
        price: 45.90,
        imageUrl: '/uploads/merchs/canecas/caneca-federada-v1.jpeg',
        sizes: [],
      }
    ]);
    console.log('Products seeded successfully.');
  } else {
    console.log('Products already exist.');
  }

  const userRepo = dataSource.getRepository(User);
  const adminExists = await userRepo.findOne({ where: { email: 'admin@federada.com.br' } });
  
  if (!adminExists) {
    console.log('Seeding initial admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepo.create({
      name: 'Administrador',
      email: 'admin@federada.com.br',
      password: hashedPassword,
      cpf: '00000000000',
      phone: '00000000000',
      role: 'ADMIN',
      emailVerified: true,
    });
    await userRepo.save(admin);
    console.log('Admin user seeded (email: admin@federada.com.br | password: admin123).');
  } else {
    console.log('Admin user already exists.');
  }

  await dataSource.destroy();
}

run().catch(console.error);
