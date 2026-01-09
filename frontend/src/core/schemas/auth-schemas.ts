import { z } from 'zod';
import { ADMIN_ROLES } from '@/core/types/adminTypes';

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
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[0-9\s\-\(\)]{10,}$/, 'Invalid phone number'),
  address: z.string().min(5, 'Address is required'),
  description: z.string().min(10, 'Description is required'),
  registrationNumber: z.string().min(1, 'Tax ID is required'),
  documents: z.instanceof(File),
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

// Customer profile registration step
export const customerProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[0-9\s\-\(\)]{10,}$/, 'Invalid phone number'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  birthDate: z.date().optional(),
});

// Supplier profile registration step
export const supplierProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[0-9\s\-\(\)]{10,}$/, 'Invalid phone number'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  registrationNumber: z.string().min(5, 'Registration number is required'),
  documents: z.array(z.instanceof(File)).min(1, 'At least one document is required'),
});

// Forgot Password
export const forgotPasswordSchema = z.object({
  email: z.string().pipe(z.email('Enter a valid email address')),
});

// Reset Password
export const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type AdminCreateFormData = z.infer<typeof adminCreateSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type RequestSupplierFormData = z.infer<typeof requestSupplierSchema>;
export type CustomerProfileFormData = z.infer<typeof customerProfileSchema>;
export type SupplierProfileFormData = z.infer<typeof supplierProfileSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;