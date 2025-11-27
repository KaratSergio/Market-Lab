import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthJwtGuard } from '@auth/guard/auth-jwt.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { USER_ROLES } from '@domain/users/types';

@Controller('admin')
@UseGuards(AuthJwtGuard)
export class AdminController {

  @Get('dashboard')
  @Roles(USER_ROLES.ADMIN)
  getDashboard() {
    return {
      message: 'Admin dashboard',
      data: {
        stats: {
          users: 0,
          products: 0,
          orders: 0,
        }
      }
    };
  }

  @Get('users')
  @Roles(USER_ROLES.ADMIN)
  getUsers() {
    return {
      message: 'Admin users management',
      users: []
    };
  }
}