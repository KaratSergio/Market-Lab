import { create } from 'zustand';
import { User, ADMIN_ROLES } from '../types';


interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  regComplete: boolean;

  // methods
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setRegComplete: (complete: boolean) => void;

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

  // Methods for checking registration status
  isRegistrationComplete: () => boolean;
  needsProfileCompletion: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  token: null,
  regComplete: false,

  setUser: (user) => set({
    user,
    regComplete: user?.regComplete ?? false
  }),

  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setToken: (token) => set({ token }),
  setRegComplete: (complete) => set({ regComplete: complete }),

  setAuth: (user: User, token: string) => {
    set({
      user,
      token,
      regComplete: user.regComplete ?? false,
      isAuthenticated: true,
      isLoading: false
    });
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      regComplete: false
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

  isRegistrationComplete: () => {
    const { regComplete } = get();
    return regComplete;
  },

  needsProfileCompletion: () => {
    const { isAuthenticated, regComplete } = get();
    return isAuthenticated && !regComplete;
  },
}));