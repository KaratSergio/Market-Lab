import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/core/api/admin.api';
import { CreateAdminDto, AdminPermissions } from '@/core/types/admin.types';
import { useAuthStore } from '@/core/store/auth-store';


// Hook for get Admins list
export const useAdmins = () => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['admins'],
    queryFn: () => adminApi.getAdmins(token!),
    enabled: !!token,
  });
};

// Hook for creating Admins
export const useCreateAdmin = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdminDto) => adminApi.createAdmin(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
};

// Hook for update Permissions
export const useUpdateAdminPermissions = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ adminId, permissions }: { adminId: string; permissions: Partial<AdminPermissions> }) =>
      adminApi.updateAdminPermissions(adminId, permissions, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
};

// Hook for deleting Admin
export const useDeleteAdmin = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adminId: string) => adminApi.deleteAdmin(adminId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
};