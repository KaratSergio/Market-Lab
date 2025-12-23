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

  // Cart permissions
  CART_READ = 'cart:read',
  CART_ADD_ITEM = 'cart:add-item',
  CART_UPDATE_ITEM = 'cart:update-item',
  CART_REMOVE_ITEM = 'cart:remove-item',
  CART_APPLY_DISCOUNT = 'cart:apply-discount',
  CART_CLEAR = 'cart:clear',
  CART_CHECKOUT = 'cart:checkout',

  // Admin cart permissions
  CART_ADMIN_READ = 'cart:admin-read',
  CART_ADMIN_CLEANUP = 'cart:admin-cleanup',

  // Order permissions
  ORDER_READ = 'order:read',
  ORDER_CREATE = 'order:create',
  ORDER_UPDATE = 'order:update',
  ORDER_READ_ALL = 'order:read-all',
  ORDER_MANAGE = 'order:manage',
  ORDER_REFUND = 'order:refund',
  ORDER_STATS_READ = 'order:stats-read',

  // Payment permissions
  PAYMENT_PROCESS = 'payment:process',
  PAYMENT_REFUND = 'payment:refund',
  PAYMENT_READ = 'payment:read',
  PAYMENT_READ_ALL = 'payment:read-all',
  PAYMENT_CREATE = 'payment:create',
  PAYMENT_UPDATE = 'payment:update',
  PAYMENT_CANCEL = 'payment:cancel',
  PAYMENT_MANAGE = 'payment:manage',
  PAYMENT_STATS_READ = 'payment:stats-read',
  PAYMENT_ADMIN_ACCESS = 'payment:admin-access',
  // Webhook permissions
  PAYMENT_WEBHOOK_STRIPE = 'payment:webhook-stripe',
  PAYMENT_WEBHOOK_PAYPAL = 'payment:webhook-paypal',
  PAYMENT_WEBHOOK_SIMULATE = 'payment:webhook-simulate',

  // Admin permissions
  ADMIN_ACCESS = 'admin:access',
  ADMIN_DASHBOARD_VIEW = 'admin:dashboard-view',
  ADMIN_USERS_MANAGE = 'admin:users-manage',
  ADMIN_SETTINGS_VIEW = 'admin:settings-view',
  ADMIN_ANALYTICS_VIEW = 'admin:analytics-view',
  ADMIN_ROLES_MANAGE = 'admin:roles-manage',
  ADMIN_PERMISSIONS_MANAGE = 'admin:permissions-manage',

  // User permissions
  USER_MANAGE = 'user:manage',
}