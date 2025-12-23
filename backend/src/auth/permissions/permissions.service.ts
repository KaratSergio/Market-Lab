import { Injectable } from '@nestjs/common';
import { Permission, Role } from '@shared/types';

@Injectable()
export class PermissionsService {
  private readonly rolePermissions: Record<Role, Permission[]> = {
    [Role.SUPER_ADMIN]: [
      Permission.ADMIN_ACCESS,
      Permission.ADMIN_DASHBOARD_VIEW,
      Permission.ADMIN_USERS_MANAGE,
      Permission.ADMIN_SETTINGS_VIEW,
      Permission.ADMIN_ANALYTICS_VIEW,
      Permission.ADMIN_ROLES_MANAGE,
      Permission.ADMIN_PERMISSIONS_MANAGE,

      // All other permissions
      ...Object.values(Permission).filter(p => !p.startsWith('admin:'))
    ],
    [Role.ADMIN]: [
      // Product permissions
      Permission.PRODUCT_READ,
      Permission.PRODUCT_CREATE,
      Permission.PRODUCT_UPDATE,
      Permission.PRODUCT_DELETE,
      Permission.PRODUCT_PURCHASE,

      // Customer permissions
      Permission.CUSTOMER_READ,
      Permission.CUSTOMER_UPDATE,
      Permission.CUSTOMER_DELETE,
      Permission.CUSTOMER_MANAGE,

      // Supplier permissions
      Permission.SUPPLIER_READ,
      Permission.SUPPLIER_UPDATE,
      Permission.SUPPLIER_MANAGE,
      Permission.SUPPLIER_APPROVE,
      Permission.SUPPLIER_SUSPEND,

      // Supplier-Customer interactions
      Permission.SUPPLIER_VIEW_CUSTOMER_CONTACTS,
      Permission.SUPPLIER_RESPOND_REVIEWS,
      Permission.SUPPLIER_MESSAGE_CUSTOMER,
      Permission.SUPPLIER_VIEW_CUSTOMER_ORDERS,

      // Customer-Supplier interactions
      Permission.CUSTOMER_VIEW_SUPPLIER_CONTACTS,
      Permission.CUSTOMER_REVIEW_SUPPLIER,
      Permission.CUSTOMER_SUBSCRIBE_SUPPLIER,
      Permission.CUSTOMER_MESSAGE_SUPPLIER,

      // Order-related
      Permission.CUSTOMER_VIEW_ORDER_HISTORY,

      // Cart permissions
      Permission.CART_ADMIN_READ,
      Permission.CART_ADMIN_CLEANUP,

      // Order permissions
      Permission.ORDER_READ,
      Permission.ORDER_CREATE,
      Permission.ORDER_UPDATE,
      Permission.ORDER_READ_ALL,
      Permission.ORDER_MANAGE,
      Permission.ORDER_REFUND,
      Permission.ORDER_STATS_READ,

      // Payment permissions
      Permission.PAYMENT_PROCESS,
      Permission.PAYMENT_REFUND,
      Permission.PAYMENT_READ,
      Permission.PAYMENT_READ_ALL,
      Permission.PAYMENT_CREATE,
      Permission.PAYMENT_UPDATE,
      Permission.PAYMENT_CANCEL,
      Permission.PAYMENT_MANAGE,
      Permission.PAYMENT_STATS_READ,
      Permission.PAYMENT_ADMIN_ACCESS,
      Permission.PAYMENT_WEBHOOK_STRIPE,
      Permission.PAYMENT_WEBHOOK_PAYPAL,
      Permission.PAYMENT_WEBHOOK_SIMULATE,

      // Admin permissions
      Permission.ADMIN_ACCESS,
      Permission.ADMIN_DASHBOARD_VIEW,
      Permission.ADMIN_USERS_MANAGE,
      Permission.ADMIN_SETTINGS_VIEW,
      Permission.ADMIN_ANALYTICS_VIEW,
      Permission.ADMIN_ROLES_MANAGE,
      Permission.ADMIN_PERMISSIONS_MANAGE,

      // User permissions
      Permission.USER_MANAGE
    ],
    [Role.MODERATOR]: [
      Permission.ADMIN_ACCESS,
      Permission.ADMIN_DASHBOARD_VIEW,
      Permission.PRODUCT_READ,
      Permission.PRODUCT_UPDATE,
      Permission.CUSTOMER_READ,
      Permission.SUPPLIER_READ,
      Permission.ORDER_READ_ALL,
      Permission.ORDER_UPDATE,
      Permission.PAYMENT_READ,
      Permission.USER_MANAGE
    ],
    [Role.SUPPORT]: [
      Permission.PRODUCT_READ,
      Permission.CUSTOMER_READ,
      Permission.ORDER_READ_ALL,
      Permission.CART_ADMIN_READ,
      Permission.ADMIN_ACCESS,
      Permission.ADMIN_DASHBOARD_VIEW,
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

      // Payment permissions (supplier can view payments for their orders)
      Permission.PAYMENT_READ,

      Permission.CUSTOMER_READ, // Suppliers can see customers (clients)
      Permission.ORDER_READ_ALL, // Can see orders for their products
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

      // Cart permissions
      Permission.CART_READ,
      Permission.CART_ADD_ITEM,
      Permission.CART_UPDATE_ITEM,
      Permission.CART_REMOVE_ITEM,
      Permission.CART_APPLY_DISCOUNT,
      Permission.CART_CLEAR,
      Permission.CART_CHECKOUT,

      // Order permissions
      Permission.ORDER_READ,
      Permission.ORDER_CREATE,
      Permission.ORDER_UPDATE,

      // Payment permissions
      Permission.PAYMENT_READ,
      Permission.PAYMENT_CREATE,
      Permission.PAYMENT_CANCEL,
    ],
    [Role.GUEST]: [
      Permission.PRODUCT_READ,
      Permission.SUPPLIER_READ,
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

  /**
   * Add new permission to role (admin method)
   */
  addPermissionToRole(role: Role, permission: Permission): void {
    if (!this.rolePermissions[role]) {
      this.rolePermissions[role] = [];
    }

    if (!this.rolePermissions[role].includes(permission)) {
      this.rolePermissions[role].push(permission);
    }
  }

  /**
   * Remove permission from role (admin method)
   */
  removePermissionFromRole(role: Role, permission: Permission): void {
    if (this.rolePermissions[role]) {
      this.rolePermissions[role] = this.rolePermissions[role].filter(
        perm => perm !== permission
      );
    }
  }

  /**
 * Get all available permissions
 */
  getAllPermissions(): Permission[] {
    return Object.values(Permission);
  }

  /**
   * Get admin-specific permissions
   */
  getAdminPermissions(): Permission[] {
    return Object.values(Permission).filter(p => p.startsWith('admin:'));
  }
}