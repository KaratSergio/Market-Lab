import { z } from 'zod';

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

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type RequestSupplierFormData = z.infer<typeof requestSupplierSchema>;