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
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

export interface User {
  id: string;
  email: string;
  roles: string[];
  permissions?: string[];
}

export interface RequestSupplierDto {
  companyName: string;
  taxId: string;
  contactPhone: string;
}