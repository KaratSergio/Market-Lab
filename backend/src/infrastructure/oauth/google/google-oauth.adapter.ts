import { Injectable } from '@nestjs/common';
import { OAuthAdapter, OAuthUser } from '@domain/users/types/oauth.type';
import { GoogleOAuthService } from './google-oauth.service';


@Injectable()
export class GoogleOAuthAdapter implements OAuthAdapter {
  constructor(private readonly googleOAuthService: GoogleOAuthService) { }

  async getAuthUrl(): Promise<string> {
    return this.googleOAuthService.getAuthUrl();
  }

  async getTokens(code: string): Promise<{ idToken: string; accessToken: string }> {
    return this.googleOAuthService.getTokens(code);
  }

  async verifyIdToken(idToken: string): Promise<OAuthUser> {
    const googleUser = await this.googleOAuthService.verifyIdToken(idToken);
    return {
      id: googleUser.id,
      email: googleUser.email,
      verified_email: googleUser.verified_email,
      name: googleUser.name,
      given_name: googleUser.given_name,
      family_name: googleUser.family_name,
      picture: googleUser.picture,
    };
  }
}