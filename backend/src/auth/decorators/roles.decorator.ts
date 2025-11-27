import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@domain/users/types';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);