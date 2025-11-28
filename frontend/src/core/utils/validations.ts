import { z } from 'zod';
import { ADMIN_ROLES } from '@/core/types/admin.types';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const requestSupplierSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  taxId: z.string().min(1, 'Tax ID is required'),
  contactPhone: z.string().min(1, 'Contact phone number is required'),
});

export const adminCreateSchema = z.object({
  email: z.string().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone is required'),
  role: z.enum([ADMIN_ROLES.ADMIN, ADMIN_ROLES.MODERATOR, ADMIN_ROLES.SUPPORT]),
  department: z.string().optional(),
});

export type AdminCreateFormData = z.infer<typeof adminCreateSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type RequestSupplierFormData = z.infer<typeof requestSupplierSchema>;