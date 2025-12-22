import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { AdminManagementService } from '@domain/admin/services/admin-management.service';
import { AuthJwtGuard, PermissionsGuard } from '@auth/guard';
import { User, Permissions } from '@auth/decorators';
import type { CreateAdminDto } from '@domain/admin/types';
import type { SessionUser } from '@auth/types';
import { Permission } from '@shared/types';


@Controller('admin/management')
@UseGuards(AuthJwtGuard, PermissionsGuard)
export class AdminManagementController {
  constructor(
    private readonly adminManagementService: AdminManagementService
  ) { }

  @Post('admins')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_USERS_MANAGE)
  async createAdmin(
    @User() user: SessionUser,
    @Body() createDto: CreateAdminDto
  ) {
    const adminId = user.id;
    return this.adminManagementService.createAdmin(adminId, createDto);
  }

  @Get('admins')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_USERS_MANAGE)
  async getAdminsList(
    @User() user: SessionUser,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('role') role?: string
  ) {
    const adminId = user.id;
    return this.adminManagementService.getAdminsList(adminId, { page, limit, role });
  }

  @Get('admins/:id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_USERS_MANAGE)
  async getAdminDetails(
    @User() user: SessionUser,
    @Param('id') targetAdminId: string
  ) {
    const adminId = user.id;
    return this.adminManagementService.getAdminDetails(adminId, targetAdminId);
  }

  @Put('admins/:id/roles')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_ROLES_MANAGE)
  async updateAdminRoles(
    @User() user: SessionUser,
    @Param('id') targetAdminId: string,
    @Body() body: { roles: string[] }
  ) {
    const updaterId = user.id;
    return this.adminManagementService.updateAdminRoles(updaterId, targetAdminId, body.roles);
  }

  @Put('admins/:id/status')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_USERS_MANAGE)
  async updateAdminStatus(
    @User() user: SessionUser,
    @Param('id') targetAdminId: string,
    @Body() body: { status: string }
  ) {
    const updaterId = user.id;
    return this.adminManagementService.updateAdminStatus(updaterId, targetAdminId, body.status);
  }

  @Delete('admins/:id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_USERS_MANAGE)
  async deleteAdmin(
    @User() user: SessionUser,
    @Param('id') targetAdminId: string
  ) {
    const deleteId = user.id;
    return this.adminManagementService.deleteAdmin(deleteId, targetAdminId);
  }

  @Get('users')
  @Permissions(Permission.ADMIN_ACCESS, Permission.USER_MANAGE)
  async getUsersList(
    @User() user: SessionUser,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('role') role?: string
  ) {
    const adminId = user.id;
    return this.adminManagementService.getUsersList(adminId, { page, limit, role });
  }

  @Put('users/:id/roles')
  @Permissions(Permission.ADMIN_ACCESS, Permission.USER_MANAGE)
  async updateUserRoles(
    @User() user: SessionUser,
    @Param('id') userId: string,
    @Body() body: { roles: string[] }
  ) {
    const updaterId = user.id;
    return this.adminManagementService.updateUserRoles(updaterId, userId, body.roles);
  }
}