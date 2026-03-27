import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reflector } from '@nestjs/core';
import { Model } from 'mongoose';
import { ERROR_CODE } from 'src/common/constants/error-code.constant';
import { ERROR_MESSAGE } from 'src/common/constants/error-message.constant';
import { APIErrorResponse } from 'src/common/interfaces/api-response.interface';
import { RequestWithUser } from 'src/jwt/jwt.guard';
import { Staff, StaffDocument, StaffRole } from 'src/schemas/staff.schema';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectModel(Staff.name)
    private readonly staffModel: Model<StaffDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<StaffRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    const userRoleValue = user?.role;
    const userRolesValue = user?.roles;

    const roleList: string[] = [];

    if (typeof userRoleValue === 'string') {
      roleList.push(userRoleValue);
    }

    if (Array.isArray(userRolesValue)) {
      for (const item of userRolesValue) {
        if (typeof item === 'string') {
          roleList.push(item);
        }
      }
    }

    if (roleList.length === 0) {
      const username =
        typeof user?.username === 'string' ? user.username.toLowerCase() : '';

      if (username) {
        const staff = await this.staffModel.findOne({ email: username }).exec();

        if (staff?.role) {
          roleList.push(staff.role);
        }
      }
    }

    const hasRole = requiredRoles.some((role) => roleList.includes(role));

    if (!hasRole) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.UNAUTHORIZED,
        ERROR_CODE.ALL_ERROR,
      );
      throw new UnauthorizedException(error);
    }

    return true;
  }
}
