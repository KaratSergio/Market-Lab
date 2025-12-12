import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { GoogleUserInfo, GoogleTokens } from './google-user.type';
import { GoogleUserMapper } from './google-user.mapper';


@Injectable()
export class GoogleOAuthService {
  private readonly client: OAuth2Client;
  private readonly clientId: string;
  private readonly redirectUri: string;

  constructor(private readonly configService: ConfigService) {
    const { clientId, clientSecret, redirectUri } =
      this.configService.get('googleOAuth');

    this.clientId = clientId;
    this.redirectUri = redirectUri;

    this.client = new OAuth2Client({
      clientId,
      clientSecret,
    });
  }

  async verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) throw new BadRequestException('Invalid Google token');

      return {
        id: payload.sub,
        email: payload.email!,
        verified_email: payload.email_verified || false,
        name: payload.name || '',
        given_name: payload.given_name || '',
        family_name: payload.family_name || '',
        picture: payload.picture || '',
        locale: payload.locale || 'en',
      };
    } catch (error) {
      throw new BadRequestException(
        `Google token verification failed: ${error.message}`,
      );
    }
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async getTokens(code: string): Promise<GoogleTokens> {
    try {
      const { tokens } = await this.client.getToken({
        code,
        redirect_uri: this.redirectUri,
      });

      if (!tokens.id_token) {
        throw new BadRequestException('No ID token received from Google');
      }

      return {
        idToken: tokens.id_token,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || undefined,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to get Google tokens: ${error.message}`,
      );
    }
  }

  getUserForDomain(googleUser: GoogleUserInfo) {
    return GoogleUserMapper.toDomain(googleUser);
  }

  // return the domain object immediately
  async verifyAndMapToDomain(idToken: string) {
    const googleUser = await this.verifyIdToken(idToken);
    return GoogleUserMapper.toDomain(googleUser);
  }
}