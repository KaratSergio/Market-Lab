import { z } from 'zod';

export const supplierProfileSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email address'),
  description: z.string().optional(),
  address: z.object({
    country: z.string().min(2, 'Country is required'),
    city: z.string().min(2, 'City is required'),
    street: z.string().min(2, 'Street is required'),
    state: z.string().optional(),
    building: z.string().optional(),
    postalCode: z.string().optional(),
  })
});

export type SupplierProfileFormData = z.infer<typeof supplierProfileSchema>;