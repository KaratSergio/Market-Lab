import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth-api';
import { useAuthStore } from '../store/auth-store';
import { useRouter } from 'next/navigation';


// Entry hook (login)
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setUser, setIsAuthenticated, setToken } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setUser(data.user);
      setIsAuthenticated(true);
      setToken(data.access_token);
      queryClient.invalidateQueries({ queryKey: ['session'] });

      if (data.user.roles.includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/cabinet');
      }
    },
  });
};

// Hook for registration
export const useRegister = () => {
  const queryClient = useQueryClient();
  const { setUser, setIsAuthenticated } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setUser(data.user);
      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ['session'] });
      router.push('/cabinet');
    },
  });
};

// Hook for getting a session
export const useSession = () => {
  const { setUser, setIsAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const user = await authApi.getSession();

      if (user) {
        setUser(user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }

      return user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for requesting supplier status
export const useRequestSupplier = () => {
  return useMutation({
    mutationFn: authApi.requestSupplier,
  });
};

// Exit hook (logout)
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { setUser, setIsAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setUser(null);
      setIsAuthenticated(false);
      queryClient.clear();
    },
  });
};