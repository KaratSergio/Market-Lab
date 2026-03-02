import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';

import { SuperAdminInitService } from './super-admin.init';

import { seedCategories } from './seed-categories';
import { seedSuppliers } from './seed-suppliers';
import { seedProducts } from './seed-products';
import { seedTags } from './seed-tags';

const logger = new Logger('SeedRunner');

async function runAllSeeds() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    logger.log('🚀 Starting database seeding...');

    // 1. Get database connection
    const dataSource = app.get(DataSource);

    // 2. Seed categories
    logger.log('🌱 Seeding categories...');
    await seedCategories(dataSource);
    logger.log('✅ Categories seeded');

    // 3. Seed tags
    logger.log('🌱 Seeding tags...');
    await seedTags(dataSource);
    console.log('✅ Tags seeded');

    // 4. Initialize super admin
    logger.log('👑 Initializing super admin...');
    const superAdminService = app.get(SuperAdminInitService);
    await superAdminService.initializeSuperAdmin();
    logger.log('✅ Super admin initialized');

    // 5. Seed suppliers
    logger.log('👥 Seeding suppliers...');
    await seedSuppliers(dataSource);
    logger.log('✅ Suppliers seeded');

    // 6. Seed products
    logger.log('🛒 Seeding products...');
    await seedProducts(dataSource);
    logger.log('✅ Products seeded');

    logger.log('🎉 All seeds completed!');

    // 7. Show summary
    await showSummary(dataSource);

  } catch (error) {
    logger.error('💥 Seeding failed:', error.message);
    if (error.stack) {
      logger.error('Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await app.close();
  }
}

async function showSummary(dataSource: DataSource) {
  console.log('\n' + '='.repeat(50));
  console.log('📊 SEEDING SUMMARY');
  console.log('='.repeat(50));

  try {
    const counts = await Promise.all([
      dataSource.query('SELECT COUNT(*) FROM categories'),
      dataSource.query('SELECT COUNT(*) FROM users'),
      dataSource.query('SELECT COUNT(*) FROM suppliers'),
      dataSource.query('SELECT COUNT(*) FROM products'),
    ]);

    console.log(`✅ Categories: ${parseInt(counts[0][0].count)}`);
    console.log(`✅ Users: ${parseInt(counts[1][0].count)}`);
    console.log(`✅ Suppliers: ${parseInt(counts[2][0].count)}`);
    console.log(`✅ Products: ${parseInt(counts[3][0].count)}`);

  } catch (error) {
    console.log('⚠️  Could not get counts:', error.message);
  }

  console.log('\n🔑 TEST CREDENTIALS');
  console.log('='.repeat(50));
  console.log('Super Admin:');
  console.log('  Email: superadmin@system.com');
  console.log('  Password: superadmin');
  console.log('\nSuppliers (9 accounts):');
  console.log('  Email: [email]@example.com');
  console.log('  Password: 123456');
  console.log('\n' + '='.repeat(50));
}

// Run if called directly
if (require.main === module) {
  runAllSeeds();
}

export { runAllSeeds };