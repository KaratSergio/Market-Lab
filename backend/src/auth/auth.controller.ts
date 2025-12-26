import {
  Controller,
  Post, Body,
  HttpCode, Req, Res,
  UseGuards, Get, Query,
  UnauthorizedException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

// Types and DTOs
import type {
  RegisterDto,
  RegisterInitialDto,
  RegCompleteDto,
  RegSupplierProfileDto,
  AuthRequest,
  Response,
  GoogleAuthDto,
} from './types';

// Guards
import { AuthLocalGuard } from './guard/auth-local.guard';
import { AuthJwtGuard } from './guard/auth-jwt.guard';

// Main auth service (coordinator)
import { AuthService } from './services/auth.service';

// Subservices (for direct calls where needed)
import { RegistrationService } from './services/registration.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import { GoogleAuthService } from './services/google-auth.service';
import { SupplierRequestService } from './services/supplier-request.service';
import { UserService } from './services/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    // Main auth service for coordination
    private readonly authService: AuthService,

    // Subservices for specific operations
    private readonly registrationService: RegistrationService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly passwordResetService: PasswordResetService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly supplierRequestService: SupplierRequestService,
    private readonly userService: UserService,
  ) { }

  /**
   * INITIAL REGISTRATION
   * Creates user with basic info, sends verification email for non-Google registration
   */
  @Post('register-initial')
  @HttpCode(201)
  async registerInitial(
    @Body() dto: RegisterInitialDto,
    @Res({ passthrough: true }) res: Response
  ) {
    // Use registration service for initial registration
    const result = await this.registrationService.registerInitial(dto);

    // Generate auth token for immediate login
    const authResponse = await this.authService.login(result.user.id);

    // Set HTTP-only cookie for authentication
    this._setAuthCookie(res, authResponse.access_token);

    return authResponse;
  }

  /**
   * COMPLETE REGISTRATION
   * Finishes registration with role selection and profile details
   * Supports file uploads for supplier documents
   */
  @Post('register-complete')
  @UseGuards(AuthJwtGuard)
  @UseInterceptors(FilesInterceptor('documents', 10)) // Max 10 documents
  @HttpCode(200)
  async completeRegistration(
    @Req() req: AuthRequest,
    @Body() dto: RegCompleteDto,
    @Res({ passthrough: true }) res: Response,
    @UploadedFiles() documents?: Express.Multer.File[]
  ) {
    if (!req.user) throw new UnauthorizedException();

    // Use registration service for completion
    const result = await this.registrationService.completeRegistration(
      req.user.id,
      dto,
      documents
    );

    // Generate new token with updated roles
    const authResponse = await this.authService.login(result.user.id);

    // Update auth cookie
    this._setAuthCookie(res, authResponse.access_token);

    return authResponse;
  }

  /**
   * LOGIN
   * Authenticates user with email/password using local strategy
   */
  @UseGuards(AuthLocalGuard)
  @Post('login')
  @HttpCode(200)
  async login(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    if (!req.user) throw new UnauthorizedException();

    // Use main auth service for login
    const result = await this.authService.login(req.user.id);

    // Set auth cookie
    this._setAuthCookie(res, result.access_token);

    return result;
  }

  /**
   * LOGOUT
   * Clears authentication cookie
   */
  @Post('logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response) {
    this._clearAuthCookie(res);
    return { message: 'Logged out successfully' };
  }

  /**
   * GET SESSION USER
   * Returns current authenticated user info
   */
  @UseGuards(AuthJwtGuard)
  @Get('session/user')
  async getSession(@Req() req: AuthRequest) {
    return req.user || null;
  }

  /**
   * REQUEST SUPPLIER ROLE
   * Allows existing users to request supplier status
   */
  @UseGuards(AuthJwtGuard)
  @Post('request-supplier')
  async requestSupplier(
    @Req() req: AuthRequest,
    @Body() dto: RegSupplierProfileDto,
  ) {
    if (!req.user) throw new UnauthorizedException();

    // Use supplier request service
    const result = await this.supplierRequestService.requestSupplier(
      req.user.id,
      dto
    );

    // Generate new token with updated roles
    const authResponse = await this.authService.login(result.user.id);

    return authResponse;
  }

  /**
   * GET REGISTRATION STATUS
   * Checks if user has completed registration
   */
  @UseGuards(AuthJwtGuard)
  @Get('reg-status')
  async getRegistrationStatus(@Req() req: AuthRequest) {
    if (!req.user) throw new UnauthorizedException();

    const user = await this.userService.findByEmail(req.user.email);
    if (!user) throw new UnauthorizedException();

    return {
      regComplete: user.regComplete,
      roles: user.roles,
      emailVerified: user.emailVerified,
    };
  }

  /**
   * ADMIN REGISTRATION
   * Creates fully registered user (admin-only in production)
   * NOTE: Add @Roles('admin', 'super_admin') guard in production
   */
  @Post('register-admin')
  @HttpCode(201)
  async registerAdmin(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ) {
    // Use registration service for admin registration
    const result = await this.registrationService.registerAdmin(dto);

    // Generate auth token
    const authResponse = await this.authService.login(result.user.id);

    // Set auth cookie
    this._setAuthCookie(res, authResponse.access_token);

    return authResponse;
  }

  // ================= EMAIL VERIFICATION =================

  /**
   * SEND VERIFICATION EMAIL
   * Sends verification link to user's email
   */
  @Post('send-verification')
  @HttpCode(200)
  async sendVerification(@Body('email') email: string) {
    await this.emailVerificationService.sendVerificationEmail(email);
    return {
      message: 'If the email exists, verification instructions have been sent'
    };
  }

  /**
   * VERIFY EMAIL WITH TOKEN
   * Verifies user's email using token from verification link
   */
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const result = await this.emailVerificationService.verifyEmail(token);

    if (result.success) {
      return {
        success: true,
        message: 'Email verified successfully'
      };
    } else {
      return {
        success: false,
        message: result.message
      };
    }
  }

  /**
   * RESEND VERIFICATION EMAIL (for authenticated users)
   * Resends verification email to currently logged in user
   */
  @UseGuards(AuthJwtGuard)
  @Post('resend-verification')
  async resendVerification(@Req() req: AuthRequest) {
    if (!req.user) throw new UnauthorizedException();

    const user = await this.userService.findByEmail(req.user.email);
    if (!user) throw new UnauthorizedException();

    await this.emailVerificationService.sendVerificationEmail(user.email);
    return { message: 'Verification email sent' };
  }

  /**
   * CHECK EMAIL VERIFICATION STATUS
   * Returns whether current user's email is verified
   */
  @UseGuards(AuthJwtGuard)
  @Get('check-email-verification')
  async checkEmailVerification(@Req() req: AuthRequest) {
    if (!req.user) throw new UnauthorizedException();

    return this.emailVerificationService.checkEmailVerification(req.user.id);
  }

  // ================= PASSWORD RESET =================

  /**
   * REQUEST PASSWORD RESET
   * Sends password reset link to user's email
   */
  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body('email') email: string) {
    await this.passwordResetService.requestPasswordReset(email);
    return {
      message: 'If the email exists, password reset instructions have been sent'
    };
  }

  /**
   * RESET PASSWORD WITH TOKEN
   * Sets new password using token from reset link
   */
  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    const result = await this.passwordResetService.resetPassword(
      token,
      newPassword
    );

    if (result.success) {
      return {
        success: true,
        message: 'Password reset successful'
      };
    } else {
      return {
        success: false,
        message: result.message
      };
    }
  }

  // ================= GOOGLE OAUTH =================

  /**
   * GET GOOGLE AUTH URL
   * Returns Google OAuth URL for frontend redirection
   */
  @Get('google/url')
  async getGoogleAuthUrl() {
    return this.googleAuthService.getGoogleAuthUrl();
  }

  /**
   * HANDLE GOOGLE OAUTH CALLBACK (server-side flow)
   * Processes authorization code from Google redirect
   */
  @Get('google/callback')
  @HttpCode(200)
  async googleCallbackFrontend(
    @Query('code') code: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.googleAuthService.handleGoogleCallback(code);

    // Generate auth token for the user
    const authResponse = await this.authService.login(result.user.id);

    // Set auth cookie
    this._setAuthCookie(res, authResponse.access_token);

    return authResponse;
  }

  /**
   * AUTHENTICATE WITH GOOGLE ID TOKEN
   * For mobile apps using Google Sign-In
   */
  @Post('google')
  @HttpCode(200)
  async googleAuth(
    @Body() dto: GoogleAuthDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.googleAuthService.authWithGoogle(dto);

    // Generate auth token
    const authResponse = await this.authService.login(result.user.id);

    // Set auth cookie
    this._setAuthCookie(res, authResponse.access_token);

    return authResponse;
  }

  /**
   * LINK GOOGLE ACCOUNT TO EXISTING USER
   * Connects Google account to authenticated user
   */
  @UseGuards(AuthJwtGuard)
  @Post('google/link')
  async linkGoogleAccount(
    @Req() req: AuthRequest,
    @Body() dto: GoogleAuthDto
  ) {
    if (!req.user) throw new UnauthorizedException();

    return this.googleAuthService.linkGoogleAccount(req.user.id, dto);
  }

  /**
   * UNLINK GOOGLE ACCOUNT
   * Disconnects Google account from authenticated user
   */
  @UseGuards(AuthJwtGuard)
  @Post('google/unlink')
  async unlinkGoogleAccount(@Req() req: AuthRequest) {
    if (!req.user) throw new UnauthorizedException();

    return this.googleAuthService.unlinkGoogleAccount(req.user.id);
  }

  // ================= HELPER METHODS =================

  /**
   * Set authentication cookie
   * @private Internal method for cookie management
   */
  private _setAuthCookie(res: Response, token: string): void {
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
  }

  /**
   * Clear authentication cookie
   * @private Internal method for cookie management
   */
  private _clearAuthCookie(res: Response): void {
    res.clearCookie('authToken');
  }
}