import { Controller, Post, Body, HttpCode, Req, Res, UseGuards, Get, UnauthorizedException } from '@nestjs/common';
import type { RequestSupplierDto, RegisterDto, AuthRequest, Response } from './types';
import { AuthService } from './auth.service';
import { AuthLocalGuard } from './guard/auth-local.guard';
import { AuthJwtGuard } from './guard/auth-jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @HttpCode(201)
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const tokenRes = await this.authService.register(dto);

    res.cookie('authToken', tokenRes.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    return tokenRes;
  }

  @UseGuards(AuthLocalGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Req() req: AuthRequest, @Res({ passthrough: true }) res: Response) {
    const user = req.user;

    if (!user) throw new UnauthorizedException();

    const tokenRes = await this.authService.login(user.id);

    res.cookie('authToken', tokenRes.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    return tokenRes;
  }
  @UseGuards(AuthJwtGuard)
  @Get('session/user')
  async getSession(@Req() req: AuthRequest) {
    return req.user || null;
  }

  @UseGuards(AuthJwtGuard)
  @Post('request-supplier')
  async requestSupplier(@Req() req: AuthRequest, @Body() dto: RequestSupplierDto) {
    const user = req.user;
    if (!user) throw new UnauthorizedException();

    return this.authService.requestSupplier(user.id, dto);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('authToken', {
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? 'yourdomain.com' : 'localhost',
    });

    return { message: 'Logged out successfully' };
  }
}