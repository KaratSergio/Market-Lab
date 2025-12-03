// src/core/api/authApi.ts
import {
  LoginFormData,
  RegisterFormData,
  AuthResponse,
  User,
  RequestSupplierDto,
  RegisterInitialDto,
  RegisterCompleteDto,
  SupplierProfileDto
} from '../types/authType';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Вспомогательная функция для обработки ошибок
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new ApiError(response.status, errorData.message || 'API Error');
    } catch {
      throw new ApiError(response.status, response.statusText || 'API Error');
    }
  }
  return response;
};

export const authApi = {
  // ✅ Старые методы с обновленными типами
  async login(credentials: LoginFormData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    await handleApiError(response);
    return response.json();
  },

  // ✅ Старая регистрация (оставляем для совместимости)
  async register(userData: RegisterFormData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    await handleApiError(response);
    return response.json();
  },

  // ✅ Новая начальная регистрация
  async registerInitial(dto: RegisterInitialDto): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register-initial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(dto),
    });

    await handleApiError(response);
    return response.json();
  },

  // ✅ Завершение регистрации с профилем
  async registerComplete(dto: RegisterCompleteDto & { documents?: File[] }): Promise<AuthResponse> {
    // Для покупателя или если нет файлов - отправляем JSON
    if (dto.role === 'customer' || !dto.documents?.length) {
      const response = await fetch(`${API_BASE_URL}/auth/register-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dto),
      });

      await handleApiError(response);
      return response.json();
    }

    // Для фермера с файлами - отправляем FormData
    const formData = new FormData();

    // 1. Добавляем основные поля
    formData.append('role', dto.role);

    // 2. Добавляем profile как JSON (без файлов)
    const supplierProfile = dto.profile as SupplierProfileDto;
    const profileData = {
      ...supplierProfile,
      documents: undefined // Удаляем файлы, они пойдут отдельно
    };
    formData.append('profile', JSON.stringify(profileData));

    // 3. Добавляем файлы
    if (dto.documents) {
      dto.documents.forEach((file, index) => {
        formData.append('documents', file, file.name); // Третий параметр - имя файла
      });
    }

    const response = await fetch(`${API_BASE_URL}/auth/register-complete`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    await handleApiError(response);
    return response.json();
  },

  async getSession(): Promise<User | null> {
    const response = await fetch(`${API_BASE_URL}/auth/session/user`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.status === 401) return null;
    await handleApiError(response);

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

    await handleApiError(response);
  },

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    await handleApiError(response);
  },
};