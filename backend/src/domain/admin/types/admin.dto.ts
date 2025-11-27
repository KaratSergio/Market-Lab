// Use it to type the incoming data
import { AdminRole, AdminPermissions, AdminStatus } from "./admin.type";

export interface CreateAdminDto {
  userId: string;
  firstName: string;
  lastName: string;
  phone: string,
  role: AdminRole;
  department?: string;
  permissions?: Partial<AdminPermissions>;
}

export interface UpdateAdminDto extends Partial<CreateAdminDto> {
  status?: AdminStatus;
  lastActiveAt?: Date;
}