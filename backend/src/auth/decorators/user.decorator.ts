import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SessionUser } from '../types/auth.type';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SessionUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);