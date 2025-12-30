import {
  Controller,
  Get, Post, Put, Delete,
  Body, Param,
  UseGuards, Query,
  ParseIntPipe,
  HttpCode, HttpStatus,
} from '@nestjs/common';

import {
  ApiTags, ApiOperation,
  ApiResponse, ApiBearerAuth,
  ApiBody, ApiParam, ApiQuery,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

import { AdminManagementService } from '@domain/admin/services/admin-management.service';
import { AuthJwtGuard, PermissionsGuard } from '@auth/guard';
import { User, Permissions } from '@auth/decorators';
import type { CreateAdminDto } from '@domain/admin/types';
import type { SessionUser } from '@auth/types';
import { Permission } from '@shared/types';

// Swagger DTOs
import {
  CreateAdminDtoSwagger,
  UpdateRolesDtoSwagger,
  UpdateAdminStatusDtoSwagger,
  AdminResponseDtoSwagger,
  AdminsListResponseDtoSwagger,
  UsersListResponseDtoSwagger,
} from '@domain/admin/types/admin.swagger.dto';


@ApiTags('admin-management')
@ApiBearerAuth('JWT-auth')
@Controller('admin/management')
@UseGuards(AuthJwtGuard, PermissionsGuard)
export class AdminManagementController {
  constructor(
    private readonly adminManagementService: AdminManagementService
  ) { }

  /**
   * CREATE NEW ADMIN USER
   * @description Creates a new admin user with specified permissions and roles.
   * Requires ADMIN_USERS_MANAGE permission.
   */
  @Post('admins')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_USERS_MANAGE)
  @ApiOperation({
    summary: 'Create new admin user',
    description: 'Creates a new admin user with specified permissions and roles. Requires ADMIN_USERS_MANAGE permission.'
  })
  @ApiBody({ type: CreateAdminDtoSwagger })
  @ApiCreatedResponse({
    description: 'Admin user created successfully',
    type: AdminResponseDtoSwagger,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or email already exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User lacks required permissions',
  })
  async createAdmin(
    @User() user: SessionUser,
    @Body() createDto: CreateAdminDto
  ) {
    const adminId = user.id;
    return this.adminManagementService.createAdmin(adminId, createDto);
  }

  /**
   * GET ADMINS LIST
   * @description Retrieves paginated list of all admin users.
   * Supports filtering by role. Requires ADMIN_USERS_MANAGE permission.
   */
  @Get('admins')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_USERS_MANAGE)
  @ApiOperation({
    summary: 'Get admins list',
    description: 'Retrieves paginated list of all admin users. Supports filtering by role. Requires ADMIN_USERS_MANAGE permission.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'role', required: false, type: String, description: 'Filter by role (e.g., ADMIN, SUPER_ADMIN)' })
  @ApiOkResponse({
    description: 'Admins list retrieved successfully',
    type: AdminsListResponseDtoSwagger,
  })
  async getAdminsList(
    @User() user: SessionUser,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('role') role?: string
  ) {
    const adminId = user.id;
    return this.adminManagementService.getAdminsList(adminId, { page, limit, role });
  }

  /**
   * GET ADMIN DETAILS
   * @description Retrieves detailed information about a specific admin user.
   * Requires ADMIN_USERS_MANAGE permission.
   */
  @Get('admins/:id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_USERS_MANAGE)
  @ApiOperation({
    summary: 'Get admin details',
    description: 'Retrieves detailed information about a specific admin user. Requires ADMIN_USERS_MANAGE permission.'
  })
  @ApiParam({ name: 'id', description: 'Admin user ID', example: '507f1f77bcf86cd799439011' })
  @ApiOkResponse({
    description: 'Admin details retrieved successfully',
    type: AdminResponseDtoSwagger,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Admin user not found',
  })
  async getAdminDetails(
    @User() user: SessionUser,
    @Param('id') targetAdminId: string
  ) {
    const adminId = user.id;
    return this.adminManagementService.getAdminDetails(adminId, targetAdminId);
  }

  /**
   * UPDATE ADMIN ROLES
   * @description Updates roles for a specific admin user.
   * Requires ADMIN_ROLES_MANAGE permission.
   */
  @Put('admins/:id/roles')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_ROLES_MANAGE)
  @ApiOperation({
    summary: 'Update admin roles',
    description: 'Updates roles for a specific admin user. Requires ADMIN_ROLES_MANAGE permission.'
  })
  @ApiParam({ name: 'id', description: 'Admin user ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateRolesDtoSwagger })
  @ApiOkResponse({
    description: 'Admin roles updated successfully',
    type: AdminResponseDtoSwagger,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid roles provided',
  })
  async updateAdminRoles(
    @User() user: SessionUser,
    @Param('id') targetAdminId: string,
    @Body() body: { roles: string[] }
  ) {
    const updaterId = user.id;
    return this.adminManagementService.updateAdminRoles(updaterId, targetAdminId, body.roles);
  }

  /**
   * UPDATE ADMIN STATUS
   * @description Updates status (active/inactive) for a specific admin user.
   * Requires ADMIN_USERS_MANAGE permission.
   */
  @Put('admins/:id/status')
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_USERS_MANAGE)
  @ApiOperation({
    summary: 'Update admin status',
    description: 'Updates status (active/inactive) for a specific admin user. Requires ADMIN_USERS_MANAGE permission.'
  })
  @ApiParam({ name: 'id', description: 'Admin user ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateAdminStatusDtoSwagger })
  @ApiOkResponse({
    description: 'Admin status updated successfully',
    type: AdminResponseDtoSwagger,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid status provided',
  })
  async updateAdminStatus(
    @User() user: SessionUser,
    @Param('id') targetAdminId: string,
    @Body() body: { status: string }
  ) {
    const updaterId = user.id;
    return this.adminManagementService.updateAdminStatus(updaterId, targetAdminId, body.status);
  }

  /**
   * DELETE ADMIN USER
   * @description Deletes a specific admin user from the system.
   * Cannot delete self. Requires ADMIN_USERS_MANAGE permission.
   */
  @Delete('admins/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions(Permission.ADMIN_ACCESS, Permission.ADMIN_USERS_MANAGE)
  @ApiOperation({
    summary: 'Delete admin user',
    description: 'Deletes a specific admin user from the system. Cannot delete self. Requires ADMIN_USERS_MANAGE permission.'
  })
  @ApiParam({ name: 'id', description: 'Admin user ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Admin deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete own account',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Admin user not found',
  })
  async deleteAdmin(
    @User() user: SessionUser,
    @Param('id') targetAdminId: string
  ) {
    const deleteId = user.id;
    return this.adminManagementService.deleteAdmin(deleteId, targetAdminId);
  }

  /**
   * GET USERS LIST
   * @description Retrieves paginated list of all system users (non-admin).
   * Supports filtering by role. Requires USER_MANAGE permission.
   */
  @Get('users')
  @Permissions(Permission.ADMIN_ACCESS, Permission.USER_MANAGE)
  @ApiOperation({
    summary: 'Get users list',
    description: 'Retrieves paginated list of all system users (non-admin). Supports filtering by role. Requires USER_MANAGE permission.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'role', required: false, type: String, description: 'Filter by role (e.g., CUSTOMER, SUPPLIER)' })
  @ApiOkResponse({
    description: 'Users list retrieved successfully',
    type: UsersListResponseDtoSwagger,
  })
  async getUsersList(
    @User() user: SessionUser,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('role') role?: string
  ) {
    const adminId = user.id;
    return this.adminManagementService.getUsersList(adminId, { page, limit, role });
  }

  /**
   * UPDATE USER ROLES
   * @description Updates roles for a specific non-admin user.
   * Requires USER_MANAGE permission.
   */
  @Put('users/:id/roles')
  @Permissions(Permission.ADMIN_ACCESS, Permission.USER_MANAGE)
  @ApiOperation({
    summary: 'Update user roles',
    description: 'Updates roles for a specific non-admin user. Requires USER_MANAGE permission.'
  })
  @ApiParam({ name: 'id', description: 'User ID', example: '507f1f77bcf86cd799439012' })
  @ApiBody({ type: UpdateRolesDtoSwagger })
  @ApiOkResponse({
    description: 'User roles updated successfully',
    type: AdminResponseDtoSwagger,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid roles provided',
  })
  async updateUserRoles(
    @User() user: SessionUser,
    @Param('id') userId: string,
    @Body() body: { roles: string[] }
  ) {
    const updaterId = user.id;
    return this.adminManagementService.updateUserRoles(updaterId, userId, body.roles);
  }
}