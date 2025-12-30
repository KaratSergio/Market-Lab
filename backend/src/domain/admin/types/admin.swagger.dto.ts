import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsArray, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdminDtoSwagger {
  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@example.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Admin password (minimum 8 characters)',
    example: 'adminPassword123',
    minLength: 8,
    required: true,
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Admin first name',
    example: 'Admin',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Admin last name',
    example: 'User',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({
    description: 'Admin phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Initial admin roles',
    example: ['ADMIN', 'ADMIN_MODERATOR'],
    type: [String],
    required: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  roles: string[];

  @ApiProperty({
    description: 'Admin permissions',
    example: ['ADMIN_ACCESS', 'ADMIN_USERS_MANAGE'],
    type: [String],
    required: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  permissions: string[];
}

export class UpdateRolesDtoSwagger {
  @ApiProperty({
    description: 'Array of roles to assign',
    example: ['ADMIN', 'SUPER_ADMIN'],
    type: [String],
    required: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  roles: string[];
}

export class UpdateAdminStatusDtoSwagger {
  @ApiProperty({
    description: 'User status',
    example: 'active',
    enum: ['active', 'inactive', 'suspended'],
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  status: string;
}

export class PaginationQueryDtoSwagger {
  @ApiPropertyOptional({
    description: 'Page number (default: 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by role',
    example: 'ADMIN',
  })
  @IsOptional()
  @IsString()
  role?: string;
}

// Response DTOs
export class AdminResponseDtoSwagger {
  @ApiProperty({
    description: 'Admin user ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Admin email',
    example: 'admin@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Admin first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Admin last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Admin roles',
    example: ['ADMIN', 'SUPER_ADMIN'],
    type: [String],
  })
  roles: string[];

  @ApiProperty({
    description: 'Admin permissions',
    example: ['ADMIN_ACCESS', 'ADMIN_USERS_MANAGE'],
    type: [String],
  })
  permissions: string[];

  @ApiProperty({
    description: 'Admin status',
    example: 'active',
    enum: ['active', 'inactive', 'suspended'],
  })
  status: string;

  @ApiProperty({
    description: 'Created timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last updated timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class AdminListItemDtoSwagger {
  @ApiProperty({
    description: 'Admin user ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Admin email',
    example: 'admin@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Admin full name',
    example: 'John Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'Admin roles',
    example: ['ADMIN'],
    type: [String],
  })
  roles: string[];

  @ApiProperty({
    description: 'Admin status',
    example: 'active',
  })
  status: string;
}

export class AdminsListResponseDtoSwagger {
  @ApiProperty({
    description: 'List of admin users',
    type: [AdminListItemDtoSwagger],
  })
  admins: AdminListItemDtoSwagger[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      page: 1,
      limit: 10,
      total: 100,
      pages: 10,
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class UsersListResponseDtoSwagger {
  @ApiProperty({
    description: 'List of users',
    type: [Object],
  })
  users: any[];

  @ApiProperty({
    description: 'Pagination metadata',
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class SuccessResponseDtoSwagger {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Response data',
  })
  data?: any;
}

export class DashboardResponseDtoSwagger {
  @ApiProperty({
    description: 'Response message',
    example: 'Admin dashboard',
  })
  message: string;

  @ApiProperty({
    description: 'Dashboard data',
  })
  data: {
    systemStats: any;
    performanceMetrics: any;
    quickStats: {
      totalUsers: number;
      totalProducts: number;
      totalOrders: number;
      totalRevenue: number;
    };
  };
}

export class AnalyticsResponseDtoSwagger {
  @ApiProperty({
    description: 'Response message',
    example: 'Admin analytics',
  })
  message: string;

  @ApiProperty({
    description: 'Analytics data',
  })
  data: {
    salesData: any[];
    userGrowth: any[];
    popularProducts: any[];
    revenueByCategory: any[];
  };
}

export class SettingsResponseDtoSwagger {
  @ApiProperty({
    description: 'Response message',
    example: 'Admin settings',
  })
  message: string;

  @ApiProperty({
    description: 'Settings data',
  })
  data: {
    systemSettings: any;
    paymentSettings: any;
    notificationSettings: any;
  };
}

export class PermissionsListResponseDtoSwagger {
  @ApiProperty({
    description: 'Response message',
    example: 'Available permissions',
  })
  message: string;

  @ApiProperty({
    description: 'Permissions data',
  })
  data: {
    permissions: string[];
  };
}

export class RolesListResponseDtoSwagger {
  @ApiProperty({
    description: 'Response message',
    example: 'Available roles',
  })
  message: string;

  @ApiProperty({
    description: 'Roles data',
  })
  data: {
    roles: string[];
  };
}