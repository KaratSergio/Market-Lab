export enum Permission {
  // Product permissions
  PRODUCT_READ = 'product:read',
  PRODUCT_CREATE = 'product:create',
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_DELETE = 'product:delete',
  PRODUCT_PURCHASE = 'product:purchase',

  // Customer permissions
  CUSTOMER_READ = 'customer:read',
  CUSTOMER_UPDATE = 'customer:update',
  CUSTOMER_DELETE = 'customer:delete',
  CUSTOMER_MANAGE = 'customer:manage',

  // Admin permissions
  ADMIN_ACCESS = 'admin:access',

  // User permissions
  USER_MANAGE = 'user:manage',
}