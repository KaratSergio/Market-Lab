import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthJwtGuard, RolesGuard } from '../guard';
import { PermissionsGuard } from '../guard/permissions.guard';
import { Roles } from './roles.decorator';
import { Permissions } from './permissions.decorator';
import { Permission, Role } from '@shared/types';

//! Combined decorator for protecting routes

export function Auth(
  roles?: Role[],
  permissions?: Permission[]
) {
  const decorators = [
    UseGuards(AuthJwtGuard),
  ];

  if (roles && roles.length > 0) {
    decorators.push(UseGuards(RolesGuard), Roles(...roles));
  }

  if (permissions && permissions.length > 0) {
    decorators.push(UseGuards(PermissionsGuard), Permissions(...permissions));
  }

  return applyDecorators(...decorators);
}

// Simplified decorators for common cases
export function AdminOnly() {
  return Auth([Role.ADMIN], [Permission.ADMIN_ACCESS]);
}

export function SupplierOnly() {
  return Auth([Role.SUPPLIER]);
}

export function CustomerOnly() {
  return Auth([Role.CUSTOMER]);
}

export function SupplierOrAdmin() {
  return Auth([Role.SUPPLIER, Role.ADMIN]);
}

export function AuthenticatedOnly() {
  return Auth(); // JWT only, no role checking
}