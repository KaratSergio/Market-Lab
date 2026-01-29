import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Entities
import { UserDomainEntity } from '@domain/users/user.entity';

// Services
import { UserService } from './user.service';


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  /**
   * Login user and generate JWT token
   */
  async login(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return this._generateAuthResponse(user);
  }

  /**
   * Validate user credentials for local strategy
   */
  async validateUser(email: string, password: string) {
    return this.userService.validateUser(email, password);
  }

  /**
   * Generate authentication response with JWT token
   * @private Internal method for generating standardized auth response
   */
  private _generateAuthResponse(user: UserDomainEntity) {
    const tokenPayload = {
      id: user.id,
      email: user.email,
      roles: user.roles,
      regComplete: user.regComplete,
    };

    const accessToken = this.jwtService.sign(tokenPayload);
    const { passwordHash: _, ...safeUser } = user;

    return {
      access_token: accessToken,
      user: safeUser,
    };
  }
}