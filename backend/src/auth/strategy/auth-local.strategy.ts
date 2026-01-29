import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { PermissionsService } from '../services/permissions.service';
import { Role } from '@shared/types';
import { SessionUser } from '../types';


@Injectable()
export class AuthLocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly permissionsService: PermissionsService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password'
    });
  }

  async validate(email: string, password: string): Promise<SessionUser> {
    const user = await this.authService.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.status !== 'active') throw new ForbiddenException('Account is not active');

    const roles = user.roles as Role[];
    const permissions = this.permissionsService.getPermissionsByRoles(roles);
    const name = this._getSimpleName(roles);

    return {
      id: user.id,
      email: user.email,
      roles: roles,
      name: name,
      regComplete: user.regComplete,
      permissions: permissions,
    };
  }

  private _getSimpleName(roles: Role[]): string | undefined {
    if (roles.includes(Role.ADMIN) || roles.includes(Role.SUPER_ADMIN)) return 'Administrator';
    if (roles.includes(Role.CUSTOMER)) return 'Customer';
    if (roles.includes(Role.SUPPLIER)) return 'Supplier';

    return undefined;
  }
}