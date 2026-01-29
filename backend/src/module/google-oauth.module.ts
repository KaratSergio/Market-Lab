import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleOAuthService } from '@infrastructure/oauth/google/google-oauth.service';
import { GoogleOAuthAdapter } from '@infrastructure/oauth/google/google-oauth.adapter';


@Module({
  imports: [ConfigModule],
  providers: [
    GoogleOAuthService,
    GoogleOAuthAdapter,
    {
      provide: 'OAuthAdapter',
      useClass: GoogleOAuthAdapter,
    },
  ],
  exports: [
    GoogleOAuthService,
    GoogleOAuthAdapter,
    'OAuthAdapter',
  ],
})
export class GoogleOAuthModule { }