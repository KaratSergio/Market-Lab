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

  // Supplier permissions
  SUPPLIER_READ = 'supplier:read',
  SUPPLIER_UPDATE = 'supplier:update',
  SUPPLIER_MANAGE = 'supplier:manage',
  SUPPLIER_APPROVE = 'supplier:approve',
  SUPPLIER_SUSPEND = 'supplier:suspend',

  // Supplier-Customer interactions
  SUPPLIER_VIEW_CUSTOMER_CONTACTS = 'supplier:view-customer-contacts',
  SUPPLIER_RESPOND_REVIEWS = 'supplier:respond-reviews',
  SUPPLIER_MESSAGE_CUSTOMER = 'supplier:message-customer',
  SUPPLIER_VIEW_CUSTOMER_ORDERS = 'supplier:view-customer-orders',

  // Customer-Supplier interactions
  CUSTOMER_VIEW_SUPPLIER_CONTACTS = 'customer:view-supplier-contacts',
  CUSTOMER_REVIEW_SUPPLIER = 'customer:review-supplier',
  CUSTOMER_SUBSCRIBE_SUPPLIER = 'customer:subscribe-supplier',
  CUSTOMER_MESSAGE_SUPPLIER = 'customer:message-supplier',

  // Order-related
  CUSTOMER_VIEW_ORDER_HISTORY = 'customer:view-order-history',

  // Admin permissions
  ADMIN_ACCESS = 'admin:access',

  // User permissions
  USER_MANAGE = 'user:manage',
}