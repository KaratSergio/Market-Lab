import { apiFetch } from '../utils/api-utils';
import { ADMIN_ENDPOINTS } from '../constants/api-config';

import {
  Admin,
  CreateAdminDto,
  AdminResponse,
  AdminPermissions,
} from '../types/adminTypes';

/**
 * Admin management API client
 * Requires authentication token for all operations
 */
export const adminApi = {
  /**
   * Creates a new admin user with specified permissions
   * @param data Admin creation data
   * @param token JWT authentication token
   */
  createAdmin: async (
    data: CreateAdminDto,
    token: string
  ): Promise<AdminResponse> => {
    return apiFetch<AdminResponse>(
      ADMIN_ENDPOINTS.ADMINS,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      { token }
    );
  },

  /**
   * Retrieves list of all administrators
   * @param token JWT authentication token
   */
  getAdmins: async (token: string): Promise<Admin[]> => {
    return apiFetch<Admin[]>(
      ADMIN_ENDPOINTS.ADMINS,
      { method: 'GET' },
      { token }
    );
  },

  /**
   * Updates permissions for a specific admin
   * @param adminId Target admin identifier
   * @param permissions New permission set
   * @param token JWT authentication token
   */
  updateAdminPermissions: async (
    adminId: string,
    permissions: Partial<AdminPermissions>,
    token: string
  ): Promise<Admin> => {
    return apiFetch<Admin>(
      ADMIN_ENDPOINTS.ADMIN_PERMISSIONS(adminId),
      {
        method: 'PUT',
        body: JSON.stringify({ permissions }),
      },
      { token }
    );
  },

  /**
   * Removes an admin from the system
   * @param adminId Admin identifier to delete
   * @param token JWT authentication token
   */
  deleteAdmin: async (adminId: string, token: string): Promise<void> => {
    return apiFetch<void>(
      ADMIN_ENDPOINTS.ADMIN_BY_ID(adminId),
      { method: 'DELETE' },
      { token }
    );
  },
} as const;