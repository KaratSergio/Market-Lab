import { z } from 'zod';
import { addressSchema } from './address-schemas';

export const createSupplierSchemas = (locale: string = 'en') => {
  const messages = {
    en: {
      firstName: 'First name must be at least 2 characters',
      lastName: 'Last name must be at least 2 characters',
      phone: 'Invalid phone number',
      companyName: 'Company name must be at least 2 characters',
      description: 'Description must be at least 10 characters',
      registrationNumber: 'Registration number is required',
      documents: 'At least one document is required',
      email: 'Invalid email address',
      emailRequired: 'Email is required',
    },
    uk: {
      firstName: "Ім'я має містити щонайменше 2 символи",
      lastName: 'Прізвище має містити щонайменше 2 символи',
      phone: 'Невірний номер телефону',
      companyName: 'Назва компанії має містити щонайменше 2 символи',
      description: 'Опис має містити щонайменше 10 символів',
      registrationNumber: 'Реєстраційний номер обовʼязковий',
      documents: 'Необхідно завантажити хоча б один документ',
      email: 'Невірна адреса електронної пошти',
      emailRequired: 'Електронна пошта обовʼязкова',
    },
  };

  const t = locale === 'uk' ? messages.uk : messages.en;

  // Supplier profile registration step
  const supplierRegistrationSchema = z.object({
    firstName: z.string().min(2, t.firstName),
    lastName: z.string().min(2, t.lastName),
    phone: z.string().regex(/^\+?[0-9\s\-\(\)]{10,}$/, t.phone),
    address: addressSchema,
    companyName: z.string().min(2, t.companyName),
    description: z.string().min(10, t.description),
    registrationNumber: z.string().min(5, t.registrationNumber),
    documents: z.array(z.instanceof(File)).min(1, t.documents),
  });

  // Supplier profile update/edit
  const supplierProfileSchema = z.object({
    companyName: z.string().min(2, t.companyName),
    firstName: z.string().min(2, t.firstName),
    lastName: z.string().min(2, t.lastName),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, t.phone),
    email: z.string().min(1, t.emailRequired).pipe(z.email(t.email)),
    description: z.string().optional(),
    address: addressSchema,
  });

  return {
    supplierRegistrationSchema,
    supplierProfileSchema,
  };
};

// Export the English version by default for backward compatibility
const defaultSchemas = createSupplierSchemas('en');
export const { supplierRegistrationSchema, supplierProfileSchema } = defaultSchemas;

export type SupplierRegistrationFormData = z.infer<typeof supplierRegistrationSchema>;
export type SupplierProfileFormData = z.infer<typeof supplierProfileSchema>;