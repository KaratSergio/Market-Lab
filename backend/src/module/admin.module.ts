import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminOrmEntity } from '@infrastructure/database/postgres/admin/admin.entity';
import { PostgresAdminRepository } from '@infrastructure/database/postgres/admin/admin.repository';
import { AdminController } from '@controller/admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdminOrmEntity])],
  controllers: [AdminController],
  providers: [
    {
      provide: 'AdminRepository',
      useClass: PostgresAdminRepository,
    },
  ],
  exports: ['AdminRepository'],
})
export class AdminModule { }