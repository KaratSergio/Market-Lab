import { Role, Permission } from '@shared/types';

export const AUTH_PROVIDERS = {
  EMAIL: 'email',
  GOOGLE: 'google',
  FACEBOOK: 'facebook'
} as const;

export type AuthProvider = typeof AUTH_PROVIDERS[keyof typeof AUTH_PROVIDERS];

export interface JwtPayload {
  id: string;          // User ID
  email: string;
  roles: Role[];
  regComplete?: boolean;
  name?: string;
  iat?: number;        // issued at
  exp?: number;        // expiration
}

export interface SessionUser extends Omit<JwtPayload, 'id' | 'iat' | 'exp'> {
  id: string;
  permissions: Permission[];
}

export interface ValidateUserResponse {
  success: boolean;
  message?: string;
  payload?: Omit<SessionUser, 'permissions'>;
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