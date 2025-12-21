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

      Permission.SUPPLIER_READ,
      Permission.SUPPLIER_UPDATE,
      Permission.SUPPLIER_MANAGE,
      Permission.SUPPLIER_APPROVE,
      Permission.SUPPLIER_SUSPEND,

      Permission.SUPPLIER_VIEW_CUSTOMER_CONTACTS,
      Permission.SUPPLIER_RESPOND_REVIEWS,
      Permission.SUPPLIER_MESSAGE_CUSTOMER,
      Permission.SUPPLIER_VIEW_CUSTOMER_ORDERS,

      Permission.CUSTOMER_VIEW_SUPPLIER_CONTACTS,
      Permission.CUSTOMER_REVIEW_SUPPLIER,
      Permission.CUSTOMER_SUBSCRIBE_SUPPLIER,
      Permission.CUSTOMER_MESSAGE_SUPPLIER,

      Permission.CUSTOMER_VIEW_ORDER_HISTORY,

      Permission.CART_ADMIN_READ,
      Permission.CART_ADMIN_CLEANUP,

      Permission.ADMIN_ACCESS,

      Permission.USER_MANAGE
    ],
    [Role.SUPPLIER]: [
      // Product permissions
      Permission.PRODUCT_READ,
      Permission.PRODUCT_CREATE,
      Permission.PRODUCT_UPDATE,
      Permission.PRODUCT_DELETE,
      Permission.PRODUCT_PURCHASE,

      // Supplier self-management
      Permission.SUPPLIER_READ,
      Permission.SUPPLIER_UPDATE,

      // Customer interaction permissions
      Permission.SUPPLIER_VIEW_CUSTOMER_CONTACTS,
      Permission.SUPPLIER_RESPOND_REVIEWS,
      Permission.SUPPLIER_MESSAGE_CUSTOMER,
      Permission.SUPPLIER_VIEW_CUSTOMER_ORDERS,

      Permission.CUSTOMER_READ, // Suppliers can see customers (clients)
    ],
    [Role.CUSTOMER]: [
      // Product permissions
      Permission.PRODUCT_READ,
      Permission.PRODUCT_PURCHASE,

      // Self profile
      Permission.CUSTOMER_READ,
      Permission.CUSTOMER_UPDATE,
      Permission.CUSTOMER_DELETE,

      // Supplier interaction permissions
      Permission.CUSTOMER_VIEW_SUPPLIER_CONTACTS,
      Permission.CUSTOMER_REVIEW_SUPPLIER,
      Permission.CUSTOMER_SUBSCRIBE_SUPPLIER,
      Permission.CUSTOMER_MESSAGE_SUPPLIER,

      Permission.CUSTOMER_VIEW_ORDER_HISTORY,

      Permission.CART_READ,
      Permission.CART_ADD_ITEM,
      Permission.CART_UPDATE_ITEM,
      Permission.CART_REMOVE_ITEM,
      Permission.CART_APPLY_DISCOUNT,
      Permission.CART_CLEAR,
      Permission.CART_CHECKOUT,
    ],
    [Role.GUEST]: [
      Permission.PRODUCT_READ,
      Permission.SUPPLIER_READ
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