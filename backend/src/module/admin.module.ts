import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminOrmEntity } from '@infrastructure/database/postgres/admin/admin.entity';
import { AdminController } from '@controller/admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdminOrmEntity])],
  controllers: [AdminController],
  providers: [
    // ! AdminService 
  ],
  exports: [
    TypeOrmModule.forFeature([AdminOrmEntity]),
  ],
})
export class AdminModule { }