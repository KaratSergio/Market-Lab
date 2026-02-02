export enum Role {
  SUPER_ADMIN = 'super-admin',
  MODERATOR = 'moderator',
  SUPPORT = 'support',
  ADMIN = 'admin',
  SUPPLIER = 'supplier',
  CUSTOMER = 'customer',
  GUEST = 'guest',
}

export type EntityRole = Role.SUPPLIER | Role.CUSTOMER;
export const ENTITY_ROLES = [Role.SUPPLIER, Role.CUSTOMER] as const;

export type AdminRole = Role.ADMIN | Role.SUPER_ADMIN | Role.MODERATOR | Role.SUPPORT;
export const ADMIN_ROLES = [Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR, Role.SUPPORT] as const;

export type RegisteredRole = Exclude<Role, Role.GUEST>;
export const REGISTERED_ROLES = Object.values(Role).filter(r => r !== Role.GUEST) as RegisteredRole[];