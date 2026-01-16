import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/core/api/auth-api.ts';
import { useAuthStore } from '@/core/store/authStore';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';


export const useRegisterInitial = () => {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();
  const { redirectToRoleSelection, redirectToDashboard } = useAuthRedirect();

  return useMutation({
    mutationFn: authApi.registerInitial,
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      queryClient.invalidateQueries({ queryKey: ['session'] });

      if (!data.user.regComplete) {
        redirectToRoleSelection();
      } else {
        const role = data.user.roles[0];
        redirectToDashboard(role);
      }
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setUser, setIsAuthenticated, setToken } = useAuthStore();
  const { redirectToDashboard } = useAuthRedirect();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setToken(data.access_token);
      setUser(data.user);
      setIsAuthenticated(true);

      queryClient.invalidateQueries({ queryKey: ['session'] });

      const role = data.user.roles.find(r =>
        ['admin', 'customer', 'supplier'].includes(r)
      );
      redirectToDashboard(role);
    },
  });
};

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
    staleTime: 5 * 60 * 1000,
  });
};

export const useGoogleAuth = () => {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();
  const { redirectToRoleSelection, redirectToDashboard } = useAuthRedirect();

  return useMutation({
    mutationFn: authApi.googleAuth,
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      queryClient.invalidateQueries({ queryKey: ['session'] });

      if (!data.user.regComplete) {
        redirectToRoleSelection();
      } else {
        const role = data.user.roles[0];
        redirectToDashboard(role);
      }
    },
  });
};

export const useRegisterComplete = () => {
  const queryClient = useQueryClient();
  const { setUser, setRegComplete } = useAuthStore();
  const { redirectToDashboard } = useAuthRedirect();

  return useMutation({
    mutationFn: authApi.registerComplete,
    onSuccess: (data) => {
      setUser(data.user);
      setRegComplete(data.user.regComplete ?? true);

      queryClient.invalidateQueries({ queryKey: ['session'] });

      const role = data.user.roles[0];
      redirectToDashboard(role);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { setUser, setIsAuthenticated } = useAuthStore();
  const { redirectToLogin } = useAuthRedirect();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setUser(null);
      setIsAuthenticated(false);
      queryClient.clear();
      redirectToLogin();
    },
  });
};


export const useAuthRedirect = () => {
  const router = useRouter();
  const locale = useLocale();

  const redirectTo = (path: string) => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    router.push(`/${locale}/${cleanPath}`);
  };

  const redirectToLogin = () => redirectTo('/login');
  const redirectToHome = () => redirectTo('/');
  const redirectToDashboard = (role?: string) => {
    if (role === 'admin') return redirectTo('/admin-dashboard');
    if (role === 'customer') return redirectTo('/customer-dashboard');
    if (role === 'supplier') return redirectTo('/supplier-dashboard');
    return redirectTo('/dashboard');
  };
  const redirectToRoleSelection = () => redirectTo('/register/role');

  return {
    redirectTo,
    redirectToLogin,
    redirectToHome,
    redirectToDashboard,
    redirectToRoleSelection,
    locale
  };
};
