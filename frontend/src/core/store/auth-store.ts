import { create } from 'zustand';
import { User, ADMIN_ROLES } from '../types';


interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;

  // methods
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  // methods for token management
  setToken: (token: string | null) => void;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  // Methods of checking rights
  hasRole: (role: string) => boolean;
  isSuperAdmin: () => boolean;
  canManageAdmins: () => boolean;
  canManageUsers: () => boolean;
  canManageProducts: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  token: null,

  setUser: (user) => set({ user }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setToken: (token) => set({ token }),

  setAuth: (user: User, token: string) => {
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false
    });
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });
  },

  hasRole: (role: string) => {
    const { user } = get();
    return user?.roles.includes(role) ?? false;
  },

  isSuperAdmin: () => {
    const { user } = get();
    // Перевіряємо чи є у користувача доступ до адмін панелі
    // У майбутньому можна додати більш точну перевірку через API
    return user?.roles.includes(ADMIN_ROLES.ADMIN) ?? false;
  },

  canManageAdmins: () => {
    const { user } = get();
    return user?.roles.includes(ADMIN_ROLES.ADMIN) ?? false;
  },

  canManageUsers: () => {
    const { user } = get();
    return user?.roles.includes(ADMIN_ROLES.ADMIN) ?? false;
  },

  canManageProducts: () => {
    const { user } = get();
    return user?.roles.includes(ADMIN_ROLES.ADMIN) ?? true; // Admins and moderators
  },
}));