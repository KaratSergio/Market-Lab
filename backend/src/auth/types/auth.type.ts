export const ROLES = {
  CUSTOMER: 'customer',
  SUPPLIER: 'supplier',
  ADMIN: 'admin'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const AUTH_PROVIDERS = {
  EMAIL: 'email',
  GOOGLE: 'google',
  FACEBOOK: 'facebook'
} as const;

export type AuthProvider = typeof AUTH_PROVIDERS[keyof typeof AUTH_PROVIDERS];

export interface UserPayload {
  id: string;
  email: string;
  roles: Role[];
  regComplete: boolean;
}

export interface SessionUser extends UserPayload {
  name?: string;
  permissions?: string[];
}

export interface ValidateUserResponse {
  success: boolean;
  message?: string;
  payload?: UserPayload;
}

export interface AuthRequest extends Request {
  user: SessionUser;
}

// for OAuth Google
export interface GoogleAuthDto {
  idToken: string;
}

export interface GoogleCallbackDto {
  code: string;
}

export interface GoogleAuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    roles: string[];
    status: string;
    emailVerified: boolean;
    regComplete: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    googleId: string | null;
    googleAccessToken: string | null;
    googleRefreshToken: string | null;
  };
}

export interface GoogleLinkResponse {
  success: boolean;
  message: string;
}