import { Admin, CreateAdminDto, AdminResponse, AdminPermissions } from '../types/admin.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_MANAGEMENT = API_BASE + '/admin/management/admins';


export const adminApi = {
  // Create Admin
  createAdmin: async (data: CreateAdminDto, token: string): Promise<AdminResponse> => {
    const response = await fetch(ADMIN_MANAGEMENT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to create admin');
    return response.json();
  },

  // Get All Admins
  getAdmins: async (token: string): Promise<Admin[]> => {
    const response = await fetch(ADMIN_MANAGEMENT, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) throw new Error('Failed to fetch admins');
    const data = await response.json();
    return data;
  },

  // Update Admin Permissions
  updateAdminPermissions: async (
    adminId: string,
    permissions: Partial<AdminPermissions>,
    token: string
  ): Promise<Admin> => {
    const response = await fetch(`${ADMIN_MANAGEMENT}/${adminId}/permissions`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ permissions }),
    });

    if (!response.ok) throw new Error('Failed to update admin permissions');
    return response.json();
  },

  // Remove Admin
  deleteAdmin: async (adminId: string, token: string): Promise<void> => {
    const response = await fetch(`${ADMIN_MANAGEMENT}/${adminId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) throw new Error('Failed to delete admin');
  },
};