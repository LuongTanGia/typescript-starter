import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ERROR_CODE } from 'src/common/constants/error-code.constant';
import { ERROR_MESSAGE } from 'src/common/constants/error-message.constant';
import { APIErrorResponse } from 'src/common/interfaces/api-response.interface';

interface JwtPayload {
  [key: string]: unknown;
}

export interface RequestWithUser extends Request {
  user?: JwtPayload;
}

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.UNAUTHORIZED,
        ERROR_CODE.ALL_ERROR,
      );
      throw new UnauthorizedException(error);
    }
    try {
      // 💡 Here the JWT secret key that's used for verifying the payload
      // is the key that was passed in the JwtModule
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request.user = payload;
    } catch {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.TOKEN_EXPIRED,
        ERROR_CODE.ALL_ERROR,
      );
      throw new UnauthorizedException(error);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
