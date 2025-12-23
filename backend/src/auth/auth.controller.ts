import {
  Controller,
  Post, Body,
  HttpCode, Req, Res,
  UseGuards, Get,
  UnauthorizedException,
  Query,
} from '@nestjs/common';

import type {
  RegisterDto,
  RegisterInitialDto,
  RegCompleteDto,
  RegSupplierProfileDto,
  AuthRequest,
  Response,
  GoogleAuthDto,
} from './types';

import { AuthService } from './auth.service';
import { AuthLocalGuard } from './guard/auth-local.guard';
import { AuthJwtGuard } from './guard/auth-jwt.guard';


@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) { }

  @Post('register-initial')
  @HttpCode(201)
  async registerInitial(
    @Body() dto: RegisterInitialDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.auth.registerInitial(dto);

    res.cookie('authToken', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return result;
  }

  @Post('register-complete')
  @UseGuards(AuthJwtGuard)
  @HttpCode(200)
  async completeRegistration(
    @Req() req: AuthRequest,
    @Body() dto: RegCompleteDto,
    @Res({ passthrough: true }) res: Response
  ) {
    if (!req.user) throw new UnauthorizedException();

    const result = await this.auth.completeRegistration(req.user.id, dto);

    res.cookie('authToken', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return result;
  }

  @UseGuards(AuthLocalGuard)
  @Post('login')
  @HttpCode(200)
  async login(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    if (!req.user) throw new UnauthorizedException();

    const result = await this.auth.login(req.user.id);

    res.cookie('authToken', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return result;
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('authToken');
    return { message: 'Logged out successfully' };
  }

  @UseGuards(AuthJwtGuard)
  @Get('session/user')
  async getSession(@Req() req: AuthRequest) {
    return req.user || null;
  }

  @UseGuards(AuthJwtGuard)
  @Post('request-supplier')
  async requestSupplier(
    @Req() req: AuthRequest,
    @Body() dto: RegSupplierProfileDto,
  ) {
    if (!req.user) throw new UnauthorizedException();
    return this.auth.requestSupplier(req.user.id, dto);
  }

  @UseGuards(AuthJwtGuard)
  @Get('reg-status')
  async getRegistrationStatus(@Req() req: AuthRequest) {
    if (!req.user) throw new UnauthorizedException();

    const user = await this.auth.findByEmail(req.user.email);
    if (!user) throw new UnauthorizedException();

    return {
      regComplete: user.regComplete,
      roles: user.roles,
      emailVerified: user.emailVerified,
    };
  }

  // admin registration endpoint
  @Post('register-admin')
  @HttpCode(201)
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.register(dto);

    res.cookie('authToken', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return result;
  }

  // Email verification
  @Post('send-verification')
  @HttpCode(200)
  async sendVerification(@Body('email') email: string) {
    await this.auth.sendVerificationEmail(email);
    return { message: 'If the email exists, verification instructions have been sent' };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const result = await this.auth.verifyEmail(token);

    if (result.success) return { success: true, message: 'Email verified successfully' };
    else return { success: false, message: result.message };
  }

  // Password recovery
  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body('email') email: string) {
    await this.auth.requestPasswordReset(email);
    return { message: 'If the email exists, password reset instructions have been sent' };
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    const result = await this.auth.resetPassword(token, newPassword);

    if (result.success) return { success: true, message: 'Password reset successful' };
    else return { success: false, message: result.message };
  }

  @UseGuards(AuthJwtGuard)
  @Get('check-email-verification')
  async checkEmailVerification(@Req() req: AuthRequest) {
    if (!req.user) throw new UnauthorizedException();
    return this.auth.checkEmailVerification(req.user.id);
  }

  // Resend verification for the current user
  @UseGuards(AuthJwtGuard)
  @Post('resend-verification')
  async resendVerification(@Req() req: AuthRequest) {
    if (!req.user) throw new UnauthorizedException();

    const user = await this.auth.findByEmail(req.user.email);
    if (!user) throw new UnauthorizedException();

    await this.auth.sendVerificationEmail(user.email);
    return { message: 'Verification email sent' };
  }

  // OAuth GOOGLE
  // Get Google OAuth URL for frontend redirection
  @Get('google/url')
  async getGoogleAuthUrl() {
    return this.auth.getGoogleAuthUrl();
  }

  //Handle Google OAuth callback (server-side flow)
  //Frontend redirects to this endpoint with code
  @Get('google/callback')
  @HttpCode(200)
  async googleCallbackFrontend(
    @Query('code') code: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.auth.handleGoogleCallback(code);

    res.cookie('authToken', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return result;
  }

  // Authenticate with Google ID token (for mobile apps)
  @Post('google')
  @HttpCode(200)
  async googleAuth(
    @Body() dto: GoogleAuthDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.auth.authWithGoogle(dto);

    res.cookie('authToken', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return result;
  }

  // Link Google account to existing user
  @UseGuards(AuthJwtGuard)
  @Post('google/link')
  async linkGoogleAccount(
    @Req() req: AuthRequest,
    @Body() dto: GoogleAuthDto
  ) {
    if (!req.user) throw new UnauthorizedException();
    return this.auth.linkGoogleAccount(req.user.id, dto);
  }

  // Unlink Google account
  @UseGuards(AuthJwtGuard)
  @Post('google/unlink')
  async unlinkGoogleAccount(@Req() req: AuthRequest) {
    if (!req.user) throw new UnauthorizedException();
    return this.auth.unlinkGoogleAccount(req.user.id);
  }
}