import { Reflector } from '@nestjs/core';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../decorators';
import { Permission } from '@shared/types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    // If permissions are not required, access is allowed.
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    const { user } = context.switchToHttp().getRequest();

    // If there is no user or permissions, access is denied.
    if (!user || !user.permissions) return false;

    // Check if the user has all the required permissions
    return requiredPermissions.every(permission =>
      user.permissions.includes(permission)
    );
  }
}