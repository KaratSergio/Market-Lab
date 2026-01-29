export interface OAuthUser {
  id: string;
  email: string;
  verified_email: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export interface OAuthAdapter {
  getAuthUrl(): Promise<string>;
  getTokens(code: string): Promise<{ idToken: string; accessToken: string }>;
  verifyIdToken(idToken: string): Promise<OAuthUser>;
}