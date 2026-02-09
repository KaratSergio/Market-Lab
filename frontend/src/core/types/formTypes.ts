import {
  CustomerProfileFormData,
  SupplierProfileFormData
} from '@/core/schemas';

// Types for form field paths
export type CustomerFormFieldPath =
  | keyof CustomerProfileFormData
  | `address.${keyof CustomerProfileFormData['address']}`;

export type SupplierFormFieldPath =
  | keyof SupplierProfileFormData
  | `address.${keyof SupplierProfileFormData['address']}`;

// Specific paths for each step
export const customerStepFieldPaths = {
  0: ['firstName', 'lastName'] as const,
  1: ['phone'] as const,
  2: ['address.country', 'address.city', 'address.street', 'address.building'] as const,
} as const;

export const supplierStepFieldPaths = {
  0: ['firstName', 'lastName', 'phone'] as const,
  1: ['address.country', 'address.city', 'address.street', 'address.building'] as const,
  2: ['companyName', 'registrationNumber', 'description'] as const,
} as const;