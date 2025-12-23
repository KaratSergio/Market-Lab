import { Injectable } from "@nestjs/common";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { SessionUser, JwtPayload } from "@auth/types";
import { Request } from 'express';
import { PermissionsService } from "../permissions/permissions.service";
import { Role } from '@shared/types';


@Injectable()
export class AuthJwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly permissionsService: PermissionsService,
  ) {
    super({
      // Extract the JWT from multiple sources
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.authToken,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      // Do not ignore the expiration date of the JWT
      ignoreExpiration: false,
      // Use the secret key from the environment variables to verify the JWT
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Validate method to verify the JWT payload
  async validate(payload: JwtPayload): Promise<SessionUser> {
    if (!payload.id || !payload.email || !payload.roles) {
      throw new Error('Invalid JWT payload');
    }

    const roles: Role[] = payload.roles;
    const permissions = this.permissionsService.getPermissionsByRoles(roles);

    return {
      id: payload.id,
      email: payload.email,
      roles: roles,
      permissions: permissions,
      regComplete: payload.regComplete || true,
    };
  }
}