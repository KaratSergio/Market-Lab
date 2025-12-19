import { Injectable } from '@nestjs/common';
import { Permission, Role } from '@shared/types';

@Injectable()
export class PermissionsService {
  private readonly rolePermissions: Record<Role, Permission[]> = {
    [Role.ADMIN]: [
      Permission.PRODUCT_READ,
      Permission.PRODUCT_CREATE,
      Permission.PRODUCT_UPDATE,
      Permission.PRODUCT_DELETE,
      Permission.PRODUCT_PURCHASE,

      Permission.CUSTOMER_READ,
      Permission.CUSTOMER_UPDATE,
      Permission.CUSTOMER_DELETE,
      Permission.CUSTOMER_MANAGE,

      Permission.ADMIN_ACCESS,

      Permission.USER_MANAGE
    ],
    [Role.SUPPLIER]: [
      Permission.PRODUCT_READ,
      Permission.PRODUCT_CREATE,
      Permission.PRODUCT_UPDATE,
      Permission.PRODUCT_DELETE,
      Permission.PRODUCT_PURCHASE,
      Permission.CUSTOMER_READ, // Suppliers can see customers (clients)
    ],
    [Role.CUSTOMER]: [
      Permission.PRODUCT_READ,
      Permission.PRODUCT_PURCHASE,
      Permission.CUSTOMER_READ,
      Permission.CUSTOMER_UPDATE,
      Permission.CUSTOMER_DELETE,
    ],
    [Role.GUEST]: [
      Permission.PRODUCT_READ
    ],
  };

  /**
   * Get all permissions for a list of roles
   */
  getPermissionsByRoles(roles: Role[]): Permission[] {
    const permissions = new Set<Permission>();

    roles.forEach(role => {
      const rolePerms = this.rolePermissions[role];
      if (rolePerms) rolePerms.forEach(perm => permissions.add(perm));
    });

    return Array.from(permissions);
  }

  /**
   * Check if a user has a specific permission
   */
  hasPermission(userPermissions: Permission[], requiredPermission: Permission): boolean {
    return userPermissions.includes(requiredPermission);
  }

  /**
   * Check if the user has at least one of the required permissions
   */
  hasAnyPermission(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
    return requiredPermissions.some(perm => userPermissions.includes(perm));
  }

  /**
   * Check if the user has all required permissions
   */
  hasAllPermissions(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
    return requiredPermissions.every(perm => userPermissions.includes(perm));
  }

  /**
   * Get permissions for a specific role (for admins)
   */
  getPermissionsForRole(role: Role): Permission[] {
    return this.rolePermissions[role] || [];
  }
}