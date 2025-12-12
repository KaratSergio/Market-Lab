export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export interface GoogleUserForDomain {
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  avatarUrl?: string;
  locale?: string;
  googleId: string;
}

export interface GoogleTokens {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
}