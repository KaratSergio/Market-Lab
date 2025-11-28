import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@auth/auth.module';

import { AdminOrmEntity } from '@infrastructure/database/postgres/admin/admin.entity';
import { PostgresAdminRepository } from '@infrastructure/database/postgres/admin/admin.repository';

import { AdminController } from '@controller/admin/admin.controller';
import { AdminManagementController } from '@controller/admin/admin-management.controller';

import { AdminService } from '@domain/admin/services/admin.service';
import { AdminManagementService } from '@domain/admin/services/admin-management.service';
import { AdminDashboardService } from '@domain/admin/services/admin-dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminOrmEntity]),
    AuthModule,
  ],
  controllers: [AdminController, AdminManagementController],
  providers: [
    AdminService,
    AdminManagementService,
    AdminDashboardService,
    {
      provide: 'AdminRepository',
      useClass: PostgresAdminRepository,
    },
  ],
  exports: [
    AdminService,
    AdminManagementService
  ],
})
export class AdminModule { }