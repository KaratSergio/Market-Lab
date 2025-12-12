import { GoogleUserInfo, GoogleUserForDomain } from './google-user.type';

export class GoogleUserMapper {
  static toDomain(googleUser: GoogleUserInfo): GoogleUserForDomain {
    return {
      email: googleUser.email,
      firstName: googleUser.given_name,
      lastName: googleUser.family_name,
      emailVerified: googleUser.verified_email,
      avatarUrl: googleUser.picture || undefined,
      locale: googleUser.locale || undefined,
      googleId: googleUser.id,
    };
  }

  static toDomainFromPayload(payload: any): GoogleUserForDomain {
    return {
      email: payload.email || '',
      firstName: payload.given_name || '',
      lastName: payload.family_name || '',
      emailVerified: payload.email_verified || false,
      avatarUrl: payload.picture || undefined,
      locale: payload.locale || undefined,
      googleId: payload.sub || '',
    };
  }
}