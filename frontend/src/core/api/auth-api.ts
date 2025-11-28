import { LoginFormData, RegisterFormData, AuthResponse, User, RequestSupplierDto } from '../types/auth-type';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}


export const authApi = {
  async login(credentials: LoginFormData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new ApiError(response.status, error || 'Login error');
    }

    return response.json();
  },

  async register(userData: RegisterFormData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new ApiError(response.status, error || 'Registration error');
    }

    return response.json();
  },

  async getSession(): Promise<User | null> {
    const response = await fetch(`${API_BASE_URL}/auth/session/user`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.status === 401) return null;
    if (!response.ok) throw new ApiError(response.status, 'Error getting session');

    return response.json();
  },

  async requestSupplier(dto: RequestSupplierDto): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/request-supplier`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new ApiError(response.status, error || 'Supplier request error');
    }
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },
};