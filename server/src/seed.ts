import { DataSource } from 'typeorm';
import { Product } from './products/entities/product.entity';
import { User } from './orders/entities/user.entity';
import { Order } from './orders/entities/order.entity';

const dataSource = new DataSource({
  type: 'sqlite',
  database: 'data/database.sqlite',
  entities: [Product, User, Order],
  synchronize: true,
});

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

  await dataSource.destroy();
}

run().catch(console.error);
