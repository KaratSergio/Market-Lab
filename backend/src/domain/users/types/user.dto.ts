// Use it to type the incoming data
import { UserRole } from './user.type';

export interface CreateUserDto {
  email: string;
  password: string;
  roles: UserRole[];
}

export interface UpdateUserDto {
  email?: string;
  passwordHash?: string;
  roles?: UserRole[];
  status?: string;
  emailVerified?: boolean;
  lastLoginAt?: Date;
}

export interface RegisterUserDto {
  email: string;
  password: string;
  role: UserRole; // One role upon registration (customer or supplier)
}