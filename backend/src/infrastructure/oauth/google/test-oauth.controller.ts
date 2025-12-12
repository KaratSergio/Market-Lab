import { Controller, Get, Res, Query } from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('test-oauth')
export class TestOAuthController {
  constructor(private readonly configService: ConfigService) { }

  @Get('google-setup')
  async testGoogleSetup() {
    const googleConfig = this.configService.get('googleOAuth');
    const clientId = googleConfig.clientId;
    const redirectUri = googleConfig.redirectUri;

    return {
      status: 'Google OAuth Test',
      configSource: 'FROM googleOAuth CONFIG FILE',
      hasClientId: !!clientId,
      clientIdLength: clientId?.length || 0,
      redirectUri,
      frontendRedirectUri: googleConfig.frontendRedirectUri,
      nextSteps: [
        '1. Config loaded from google-oauth.config.ts',
        '2. Check if GOOGLE_CLIENT_ID is set in .env',
        '3. Verify redirect URI matches Google Cloud Console',
        '4. Test endpoint: GET /auth/google/url'
      ]
    };
  }


  @Get('simulate-callback')
  simulateCallback(@Res() res: Response, @Query('code') code: string) {
    // simulate callback from Google
    const redirectUri = this.configService.get<string>('FRONTEND_URL') + '/auth/google/callback';

    if (code) return res.redirect(`${redirectUri}?code=${code}&state=test`);

    return res.send(`
      <h1>Google OAuth Callback Simulation</h1>
      <p>Redirect URI: ${redirectUri}</p>
      <a href="/test-oauth/simulate-callback?code=test-auth-code">Simulate Google Callback with Code</a>
    `);
  }
}