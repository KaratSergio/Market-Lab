import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AdminManagementService } from '@domain/admin/services/admin-management.service';
import { AuthJwtGuard, RolesGuard } from '@auth/guard';
import { Roles, User } from '@auth/decorators';
import type { CreateAdminDto } from '@domain/admin/types';
import type { SessionUser } from '@auth/types/auth.type';
import { USER_ROLES } from '@domain/users/types';


@Controller('admin/management')
@UseGuards(AuthJwtGuard, RolesGuard)
export class AdminManagementController {
  constructor(private readonly adminManagementService: AdminManagementService) { }

  @Post('admins')
  @Roles(USER_ROLES.ADMIN)
  async createAdmin(@User() user: SessionUser, @Body() createDto: CreateAdminDto) {
    const adminId = user.id;
    return this.adminManagementService.createAdmin(adminId, createDto);
  }

  @Get('admins')
  @Roles(USER_ROLES.ADMIN)
  async getAdminsList(@User() user: SessionUser) {
    const adminId = user.id;
    return this.adminManagementService.getAdminsList(adminId);
  }

  @Put('admins/:id/permissions')
  @Roles(USER_ROLES.ADMIN)
  async updateAdminPermissions(
    @User() user: SessionUser,
    @Param('id') adminId: string,
    @Body() body: { permissions: any }
  ) {
    const updaterId = user.id;
    return this.adminManagementService.updateAdminPermissions(updaterId, adminId, body.permissions);
  }

  @Delete('admins/:id')
  @Roles(USER_ROLES.ADMIN)
  async deleteAdmin(@User() user: SessionUser, @Param('id') adminId: string) {
    const deleteId = user.id;
    return this.adminManagementService.deleteAdmin(deleteId, adminId);
  }
}