import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ERROR_CODE } from 'src/common/constants/error-code.constant';
import { ERROR_MESSAGE } from 'src/common/constants/error-message.constant';
import {
  APIErrorResponse,
  APIListResponse,
  APIObjectResponse,
} from 'src/common/interfaces/api-response.interface';
import { Staff, StaffDocument } from 'src/schemas/staff.schema';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name)
    private readonly staffModel: Model<StaffDocument>,
  ) {}

  async create(data: CreateStaffDto) {
    const existingStaff = await this.staffModel
      .findOne({
        $or: [{ email: data.email.toLowerCase() }, { phone: data.phone }],
      })
      .exec();

    if (existingStaff) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.STAFF_ALREADY_EXISTS,
        ERROR_CODE.ALL_ERROR,
      );
      throw new BadRequestException(error);
    }

    const newStaff = new this.staffModel({
      ...data,
      email: data.email.toLowerCase(),
    });

    await newStaff.save();
    return new APIObjectResponse(newStaff);
  }

  async findAll() {
    const listStaff = await this.staffModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
    return new APIListResponse(listStaff);
  }

  async findOne(id: string) {
    const staff = await this.staffModel.findById(id).exec();

    if (!staff) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.STAFF_NOT_FOUND,
        ERROR_CODE.ALL_ERROR,
      );
      throw new NotFoundException(error);
    }

    return new APIObjectResponse(staff);
  }

  async update(id: string, data: UpdateStaffDto) {
    const staff = await this.staffModel.findById(id).exec();

    if (!staff) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.STAFF_NOT_FOUND,
        ERROR_CODE.ALL_ERROR,
      );
      throw new NotFoundException(error);
    }

    if (data.email || data.phone) {
      const duplicateStaff = await this.staffModel
        .findOne({
          _id: { $ne: id },
          $or: [
            ...(data.email ? [{ email: data.email.toLowerCase() }] : []),
            ...(data.phone ? [{ phone: data.phone }] : []),
          ],
        })
        .exec();

      if (duplicateStaff) {
        const error = new APIErrorResponse(
          ERROR_MESSAGE.STAFF_ALREADY_EXISTS,
          ERROR_CODE.ALL_ERROR,
        );
        throw new BadRequestException(error);
      }
    }

    const hashedPassword = data.password
      ? await bcrypt.hash(data.password, 10)
      : undefined;

    const updatedStaff = await this.staffModel
      .findByIdAndUpdate(
        id,
        {
          ...data,
          ...(data.email ? { email: data.email.toLowerCase() } : {}),
          ...(hashedPassword ? { password: hashedPassword } : {}),
        },
        { new: true, runValidators: true },
      )
      .exec();

    return new APIObjectResponse(updatedStaff);
  }

  async remove(id: string) {
    const deletedStaff = await this.staffModel.findByIdAndDelete(id).exec();

    if (!deletedStaff) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.STAFF_NOT_FOUND,
        ERROR_CODE.ALL_ERROR,
      );
      throw new NotFoundException(error);
    }

    return new APIObjectResponse(deletedStaff);
  }

  findByEmail(email: string): Promise<StaffDocument | null> {
    return this.staffModel.findOne({ email: email.toLowerCase() }).exec();
  }
}
