import { apiFetch, createFormData } from '../utils/api-utils';
import { AUTH_ENDPOINTS } from '../constants/api-config';

import {
  User,
  AuthResponse,
  LoginFormData,
  RegisterFormData,
  RequestSupplierDto,
  RegisterInitialDto,
  RegisterCompleteDto,
} from '../types/authType';

/**
 * Authentication API client
 * Provides methods for user authentication and session management
 */
export const authApi = {
  /**
   * Authenticate user with email and password
   * @param credentials User login credentials
   * @returns Authentication response with tokens and user data
   */
  async login(credentials: LoginFormData): Promise<AuthResponse> {
    return apiFetch<AuthResponse>(AUTH_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Register new user account
   * @param userData User registration data
   * @returns Authentication response
   */
  async register(userData: RegisterFormData): Promise<AuthResponse> {
    return apiFetch<AuthResponse>(AUTH_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Initial step of multi-step registration process
   * @param dto Initial registration data
   * @returns Partial authentication response
   */
  async registerInitial(dto: RegisterInitialDto): Promise<AuthResponse> {
    return apiFetch<AuthResponse>(AUTH_ENDPOINTS.REGISTER_INITIAL, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Complete registration with optional document upload
   * @param dto Registration completion data
   * @returns Complete authentication response
   */
  async registerComplete(
    dto: RegisterCompleteDto & { documents?: File[] }
  ): Promise<AuthResponse> {
    const isSupplierWithDocs =
      dto.role === 'supplier' && dto.documents?.length;

    if (!isSupplierWithDocs) {
      // Simple JSON request for non-suppliers or suppliers without docs
      return apiFetch<AuthResponse>(AUTH_ENDPOINTS.REGISTER_COMPLETE, {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    }

    // FormData request for suppliers with documents
    const formData = createFormData(dto, ['documents']);

    return apiFetch<AuthResponse>(AUTH_ENDPOINTS.REGISTER_COMPLETE, {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Get current authenticated user session
   * @returns User object if authenticated, null otherwise
   */
  async getSession(): Promise<User | null> {
    try {
      return await apiFetch<User>(AUTH_ENDPOINTS.SESSION, {
        method: 'GET',
      }, {
        parseJson: true,
        customErrorHandler: (error) => {
          // Silently handle 401 errors (unauthorized)
          if (error.status === 401) {
            return null;
          }
        }
      });
    } catch (error) {
      // Return null for any session-related errors
      return null;
    }
  },

  /**
   * Request supplier account status
   * @param dto Supplier request data
   */
  async requestSupplier(dto: RequestSupplierDto): Promise<void> {
    return apiFetch<void>(AUTH_ENDPOINTS.REQUEST_SUPPLIER, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Logout current user and clear session
   */
  async logout(): Promise<void> {
    return apiFetch<void>(AUTH_ENDPOINTS.LOGOUT, {
      method: 'POST',
    });
  },

  /**
   * Refresh authentication tokens
   * @returns New authentication response
   */
  async refreshToken(): Promise<AuthResponse> {
    return apiFetch<AuthResponse>(AUTH_ENDPOINTS.REFRESH_TOKEN, {
      method: 'POST',
    });
  },

  /**
   * Request password reset email
   * @param email User email address
   */
  async forgotPassword(email: string): Promise<void> {
    return apiFetch<void>(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Reset password with token
   * @param token Reset token
   * @param newPassword New password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    return apiFetch<void>(AUTH_ENDPOINTS.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
} as const;