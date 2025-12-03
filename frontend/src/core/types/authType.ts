export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  roles: string[];
  permissions?: string[];
  regComplete?: boolean;
}

export interface RequestSupplierDto {
  companyName: string;
  taxId: string;
  contactPhone: string;
}

export interface RegisterInitialDto {
  email: string;
  password: string;
}

export interface CustomerProfileDto {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  birthDate?: string; // format ISO
}

export interface SupplierProfileDto {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  companyName: string;
  description: string;
  registrationNumber: string;
  documents?: File[]; // for frontend
  documentPaths?: string[]; // for backend
}

export interface RegisterCompleteDto {
  role: 'customer' | 'supplier';
  profile: CustomerProfileDto | SupplierProfileDto;
}