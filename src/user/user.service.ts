import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
  APIObjectResponse,
  APIListResponse,
} from 'src/common/interfaces/api-response.interface';
import { UserDto } from './dto/user.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async findAll() {
    const listUser = await this.userModel.find().exec();
    return new APIListResponse(listUser);
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).exec();
    return new APIObjectResponse(user);
  }

  async createRes(data: UserDto) {
    const newUser = new this.userModel(data);
    await newUser.save();

    return new APIObjectResponse(newUser);
  }

  async create(data: Omit<User, 'id'>) {
    const newUser = new this.userModel(data);
    await newUser.save();
    return newUser;
  }

  async update(id: string, data: UserDto) {
    const user = await this.findOne(id);

    if (!user) return null;

    Object.assign(user, data);

    const updateUser = await this.userModel
      .findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      })
      .exec();
    return new APIObjectResponse(updateUser);
  }

  delete(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }
}
