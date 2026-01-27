import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ParseData } from '@shared/decorators';

import {
  Controller,
  Post, Body, HttpCode,
  Req, Res, UseGuards,
  Get, Query,
  UnauthorizedException,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';

import {
  ApiTags, ApiOperation,
  ApiResponse, ApiBearerAuth,
  ApiBody, ApiQuery,
  ApiConsumes, ApiCookieAuth,
  ApiExcludeEndpoint,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

// Types and DTOs
import type {
  AuthRequest,
  Response,
  GoogleAuthDto,
} from './types';

import {
  RegisterDto,
  RegisterInitialDto,
  RegCompleteDto,
  RegSupplierProfileDto,

  // Swagger DTOs
  RegisterInitialDtoSwagger,
  LoginDtoSwagger,
  RegCompleteDtoSwagger,
  GoogleAuthDtoSwagger,
  ForgotPasswordDtoSwagger,
  ResetPasswordDtoSwagger,
  EmailResponseDtoSwagger,
  SuccessResponseAuthDtoSwagger,
  AuthResponseDtoSwagger,
} from './types';

// Guards
import { AuthLocalGuard, AuthJwtGuard } from './guard';

// Main auth service (coordinator)
import { AuthService } from './services/auth.service';

// Subservices (for direct calls where needed)
import { RegistrationService } from './services/registration.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import { GoogleAuthService } from './services/google-auth.service';
import { UserService } from './services/user.service';


@ApiTags('auth')
@ApiCookieAuth('authToken')
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
    private readonly userService: UserService,
  ) { }

  /**
   * INITIAL REGISTRATION - Creates user with basic info
   * @description Creates a new user account with email and password, sends verification email.
   * User receives immediate JWT token for authentication.
   */
  @Post('register-initial')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Initial user registration',
    description: 'Creates a new user account with basic information and sends verification email.'
  })
  @ApiBody({ type: RegisterInitialDtoSwagger })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    type: AuthResponseDtoSwagger,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid data or email already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
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
   * COMPLETE/UPDATE REGISTRATION - Finishes user profile or adds new role
   * @description For new users: completes registration with role selection
   * @description For existing users: adds new roles and creates profiles
   */
  @Post('register-complete')
  @UseGuards(AuthJwtGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'documents', maxCount: 10 }]))
  @HttpCode(200)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Complete registration or add new role',
    description: 'For new users: completes registration with role. For existing users: adds new role and profile. Supports file uploads for supplier documents.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RegCompleteDtoSwagger })
  @ApiOkResponse({
    description: 'Registration completed or role added successfully',
    type: AuthResponseDtoSwagger,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid data or role already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  async completeRegistration(
    @Req() req: AuthRequest,
    @ParseData() parsedDto: RegCompleteDto,
    @Res({ passthrough: true }) res: Response,
    @UploadedFiles() files?: { documents?: Express.Multer.File[] }
  ) {
    if (!req.user) throw new UnauthorizedException('User not found in request');


    // Use registration service for completion
    const result = await this.registrationService.completeRegistration(
      req.user.id,
      parsedDto,
      files?.documents || []
    );

    // Generate new token with updated roles
    const authResponse = await this.authService.login(result.user.id);

    // Update auth cookie
    this._setAuthCookie(res, authResponse.access_token);

    return authResponse;
  }

  /**
   * LOGIN - Authenticates user with credentials
   * @description Authenticates user using email and password with local strategy.
   */
  @UseGuards(AuthLocalGuard)
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates user with email and password credentials.'
  })
  @ApiBody({ type: LoginDtoSwagger })
  @ApiOkResponse({
    description: 'Login successful',
    type: AuthResponseDtoSwagger,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials',
  })
  async login(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    if (!req.user) throw new UnauthorizedException('Invalid credentials');

    // Use main auth service for login
    const result = await this.authService.login(req.user.id);

    // Set auth cookie
    this._setAuthCookie(res, result.access_token);

    return result;
  }

  /**
   * LOGOUT - Clears user authentication
   * @description Logs out user by clearing authentication cookies.
   */
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({
    summary: 'User logout',
    description: 'Clears authentication cookie and logs out user.'
  })
  @ApiOkResponse({
    description: 'Logout successful',
    type: SuccessResponseAuthDtoSwagger,
  })
  async logout(@Res({ passthrough: true }) res: Response) {
    this._clearAuthCookie(res);
    return {
      success: true,
      message: 'Logged out successfully'
    };
  }

  /**
   * GET CURRENT SESSION USER
   * @description Returns information about currently authenticated user.
   */
  @UseGuards(AuthJwtGuard)
  @Get('session/user')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current session user',
    description: 'Returns information about currently authenticated user.'
  })
  @ApiOkResponse({
    description: 'User session retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - no valid JWT token',
  })
  async getSession(@Req() req: AuthRequest) {
    return req.user || null;
  }

  /**
   * GET REGISTRATION STATUS
   * @description Checks if user has completed registration process.
   */
  @UseGuards(AuthJwtGuard)
  @Get('reg-status')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get registration status',
    description: 'Checks if user has completed registration process.'
  })
  @ApiOkResponse({
    description: 'Registration status retrieved successfully',
    schema: {
      properties: {
        regComplete: { type: 'boolean' },
        roles: { type: 'array', items: { type: 'string' } },
        emailVerified: { type: 'boolean' },
      },
    },
  })
  async getRegistrationStatus(@Req() req: AuthRequest) {
    if (!req.user) throw new UnauthorizedException('User not authenticated');

    const user = await this.userService.findByEmail(req.user.email);
    if (!user) throw new UnauthorizedException('User not found');

    return {
      regComplete: user.regComplete,
      roles: user.roles,
      emailVerified: user.emailVerified,
    };
  }

  /**
   * ADMIN REGISTRATION - Creates admin user
   * @description Creates fully registered admin user (admin-only in production).
   * NOTE: Add @Roles('admin', 'super_admin') guard in production
   */
  @Post('register-admin')
  @HttpCode(201)
  @ApiExcludeEndpoint() // Exclude from Swagger in production or add proper security
  @ApiOperation({
    summary: 'Register admin user (internal use)',
    description: 'Creates fully registered admin user. Internal use only.'
  })
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
   * @description Sends email verification link to user's email address.
   */
  @Post('send-verification')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Send verification email',
    description: 'Sends verification link to user\'s email address.'
  })
  @ApiBody({ type: ForgotPasswordDtoSwagger }) // Reuse DTO for email field
  @ApiOkResponse({
    description: 'Verification email sent if email exists',
    type: EmailResponseDtoSwagger,
  })
  async sendVerification(@Body('email') email: string) {
    await this.emailVerificationService.sendVerificationEmail(email);
    return {
      success: true,
      message: 'If the email exists, verification instructions have been sent'
    };
  }

  /**
   * VERIFY EMAIL WITH TOKEN
   * @description Verifies user's email using token from verification link.
   */
  @Get('verify-email')
  @ApiOperation({
    summary: 'Verify email with token',
    description: 'Verifies user\'s email using token from verification link.'
  })
  @ApiQuery({ name: 'token', required: true, description: 'Verification token from email' })
  @ApiOkResponse({
    description: 'Email verified successfully',
    type: SuccessResponseAuthDtoSwagger,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token',
  })
  async verifyEmail(@Query('token') token: string) {
    const result = await this.emailVerificationService.verifyEmail(token);

    if (result.success) {
      return {
        success: true,
        message: 'Email verified successfully'
      };
    } else {
      throw new BadRequestException(result.message);
    }
  }

  /**
   * RESEND VERIFICATION EMAIL (for authenticated users)
   * @description Resends verification email to currently logged in user.
   */
  @UseGuards(AuthJwtGuard)
  @Post('resend-verification')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Resend verification email',
    description: 'Resends verification email to currently logged in user.'
  })
  @ApiOkResponse({
    description: 'Verification email sent',
    type: EmailResponseDtoSwagger,
  })
  async resendVerification(@Req() req: AuthRequest) {
    if (!req.user) throw new UnauthorizedException('User not authenticated');

    const user = await this.userService.findByEmail(req.user.email);
    if (!user) throw new UnauthorizedException('User not found');

    await this.emailVerificationService.sendVerificationEmail(user.email);
    return {
      success: true,
      message: 'Verification email sent'
    };
  }

  /**
   * CHECK EMAIL VERIFICATION STATUS
   * @description Returns whether current user's email is verified.
   */
  @UseGuards(AuthJwtGuard)
  @Get('check-email-verification')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Check email verification status',
    description: 'Returns whether current user\'s email is verified.'
  })
  @ApiOkResponse({
    description: 'Email verification status',
    schema: {
      properties: {
        verified: { type: 'boolean' },
        email: { type: 'string' },
      },
    },
  })
  async checkEmailVerification(@Req() req: AuthRequest) {
    if (!req.user) throw new UnauthorizedException('User not authenticated');

    return this.emailVerificationService.checkEmailVerification(req.user.id);
  }

  // ================= PASSWORD RESET =================

  /**
   * REQUEST PASSWORD RESET
   * @description Sends password reset link to user's email address.
   */
  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Sends password reset link to user\'s email address.'
  })
  @ApiBody({ type: ForgotPasswordDtoSwagger })
  @ApiOkResponse({
    description: 'Password reset email sent if email exists',
    type: EmailResponseDtoSwagger,
  })
  async forgotPassword(@Body('email') email: string) {
    await this.passwordResetService.requestPasswordReset(email);
    return {
      success: true,
      message: 'If the email exists, password reset instructions have been sent'
    };
  }

  /**
   * RESET PASSWORD WITH TOKEN
   * @description Sets new password using token from reset link.
   */
  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reset password with token',
    description: 'Sets new password using token from reset link.'
  })
  @ApiBody({ type: ResetPasswordDtoSwagger })
  @ApiOkResponse({
    description: 'Password reset successful',
    type: SuccessResponseAuthDtoSwagger,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token',
  })
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
      throw new BadRequestException(result.message);
    }
  }

  // ================= GOOGLE OAUTH =================

  /**
   * GET GOOGLE AUTH URL
   * @description Returns Google OAuth URL for frontend redirection.
   */
  @Get('google/url')
  @ApiOperation({
    summary: 'Get Google OAuth URL',
    description: 'Returns Google OAuth URL for frontend redirection.'
  })
  @ApiOkResponse({
    description: 'Google OAuth URL',
    schema: {
      properties: {
        url: { type: 'string', description: 'Google OAuth authorization URL' },
      },
    },
  })
  async getGoogleAuthUrl() {
    const url = await this.googleAuthService.getGoogleAuthUrl();
    return { url };
  }

  /**
   * HANDLE GOOGLE OAUTH CALLBACK (server-side flow)
   * @description Processes authorization code from Google redirect.
   */
  @Get('google/callback')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: 'Processes authorization code from Google redirect.'
  })
  @ApiQuery({ name: 'code', required: true, description: 'Authorization code from Google' })
  @ApiOkResponse({
    description: 'Google authentication successful',
    type: AuthResponseDtoSwagger,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid authorization code',
  })
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
   * @description For mobile apps using Google Sign-In with ID token.
   */
  @Post('google')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Authenticate with Google ID token',
    description: 'Authenticates user using Google ID token (for mobile apps).'
  })
  @ApiBody({ type: GoogleAuthDtoSwagger })
  @ApiOkResponse({
    description: 'Google authentication successful',
    type: AuthResponseDtoSwagger,
  })
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
   * @description Connects Google account to authenticated user account.
   */
  @UseGuards(AuthJwtGuard)
  @Post('google/link')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Link Google account',
    description: 'Connects Google account to authenticated user account.'
  })
  @ApiBody({ type: GoogleAuthDtoSwagger })
  @ApiOkResponse({
    description: 'Google account linked successfully',
    type: SuccessResponseAuthDtoSwagger,
  })
  async linkGoogleAccount(
    @Req() req: AuthRequest,
    @Body() dto: GoogleAuthDto
  ) {
    if (!req.user) throw new UnauthorizedException('User not authenticated');

    return this.googleAuthService.linkGoogleAccount(req.user.id, dto);
  }

  /**
   * UNLINK GOOGLE ACCOUNT
   * @description Disconnects Google account from authenticated user.
   */
  @UseGuards(AuthJwtGuard)
  @Post('google/unlink')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Unlink Google account',
    description: 'Disconnects Google account from authenticated user.'
  })
  @ApiOkResponse({
    description: 'Google account unlinked successfully',
    type: SuccessResponseAuthDtoSwagger,
  })
  async unlinkGoogleAccount(@Req() req: AuthRequest) {
    if (!req.user) throw new UnauthorizedException('User not authenticated');

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