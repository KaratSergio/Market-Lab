import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/core/api/auth-api.ts';
import { useAuthStore } from '@/core/store/authStore';
import { useRouter } from 'next/navigation';

export const useRegisterInitial = () => {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.registerInitial,
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      queryClient.invalidateQueries({ queryKey: ['session'] });

      if (!data.user.regComplete) router.push('/register/role');
      else {
        const role = data.user.roles[0];
        router.push(role === 'customer' ? '/customer-dashboard' : '/supplier-dashboard');
      }
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setUser, setIsAuthenticated, setToken } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setToken(data.access_token);
      setUser(data.user);
      setIsAuthenticated(true);

      queryClient.invalidateQueries({ queryKey: ['session'] });

      if (data.user.roles.includes('admin')) {
        router.push('/admin-dashboard');
      } else if (data.user.roles.includes('customer')) {
        router.push('/customer-dashboard');
      } else {
        router.push('/supplier-dashboard');
      }
    },
  });
};

export const useSession = () => {
  const { setUser, setIsAuthenticated, token } = useAuthStore();

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
    staleTime: 5 * 60 * 1000,
  });
};

export const useGoogleAuth = () => {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.googleAuth,
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      queryClient.invalidateQueries({ queryKey: ['session'] });

      if (!data.user.regComplete) router.push('/register/role');
      else {
        const role = data.user.roles[0];
        router.push(role === 'customer' ? '/customer-dashboard' : '/supplier-dashboard');
      }
    },
  });
};

export const useRegisterComplete = () => {
  const queryClient = useQueryClient();
  const { setUser, setRegComplete } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.registerComplete,
    onSuccess: (data) => {
      setUser(data.user);
      setRegComplete(data.user.regComplete ?? true);

      queryClient.invalidateQueries({ queryKey: ['session'] });

      const role = data.user.roles[0];
      router.push(role === 'customer' ? '/customer-dashboard' : '/supplier-dashboard');
    },
  });
};

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