import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import {
  APIErrorResponse,
  APIObjectResponse,
} from 'src/common/interfaces/api-response.interface';
import { ERROR_MESSAGE } from 'src/common/constants/error-message.constant';
import { ERROR_CODE } from 'src/common/constants/error-code.constant';
import { Staff, StaffDocument } from 'src/schemas/staff.schema';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Staff.name)
    private readonly staffModel: Model<StaffDocument>,
    private jwtService: JwtService,
  ) {}

  async login(data: LoginDto) {
    const staff = await this.staffModel
      .findOne({ email: data.email.toLowerCase() })
      .exec();

    if (!staff) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.STAFF_NOT_FOUND,
        ERROR_CODE.ALL_ERROR,
      );
      throw new UnauthorizedException(error);
    }

    const staffPasswordMatched = await verifyPassword(
      data.password,
      staff.password,
    );

    if (!staffPasswordMatched) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.WRONG_PASSWORD,
        ERROR_CODE.ALL_ERROR,
      );
      throw new UnauthorizedException(error);
    }

    const resolvedRole = typeof staff.role === 'string' ? staff.role : 'sales';

    const payload = {
      sub: staff.id ?? '',
      username: staff.email ?? '',
      role: resolvedRole,
      roles: [resolvedRole],
    };
    await new Promise((resolve) => setTimeout(resolve, 5000)); // giả lập delay 5s
    const access_token = await this.jwtService.signAsync(payload);

    // ✅ success
    return new APIObjectResponse(
      {
        access_token,
      },
      'Login thành công',
    );
  }

  async signup(data: SignupDto) {
    const staff = await this.staffModel
      .findOne({
        $or: [{ email: data.email.toLowerCase() }, { phone: data.phone }],
      })
      .exec();

    if (staff) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.STAFF_ALREADY_EXISTS,
        ERROR_CODE.ALL_ERROR,
      );
      throw new BadRequestException(error);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newStaff = new this.staffModel({
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      password: hashedPassword,
    });
    await newStaff.save();

    const resolvedRole =
      typeof newStaff.role === 'string' ? newStaff.role : 'sales';
    const payload = {
      sub: newStaff.id ?? '',
      username: newStaff.email ?? '',
      role: resolvedRole,
      roles: [resolvedRole],
    };

    const access_token = await this.jwtService.signAsync(payload);

    return new APIObjectResponse(
      {
        access_token,
      },
      'Signup thành công',
    );
  }
}

const verifyPassword = async (plainPassword: string, savedPassword: string) => {
  try {
    return await bcrypt.compare(plainPassword, savedPassword);
  } catch {
    // fallback hỗ trợ dữ liệu cũ chưa hash
    return plainPassword === savedPassword;
  }
};
