import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ERROR_CODE } from 'src/common/constants/error-code.constant';
import { ERROR_MESSAGE } from 'src/common/constants/error-message.constant';
import {
  APIErrorResponse,
  APIListResponse,
  APIObjectResponse,
} from 'src/common/interfaces/api-response.interface';
import { Customer, CustomerDocument } from 'src/schemas/customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
  ) {}

  async create(data: CreateCustomerDto) {
    const existingCustomer = await this.customerModel
      .findOne({ phone: data.phone })
      .exec();

    if (existingCustomer) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.CUSTOMER_ALREADY_EXISTS,
        ERROR_CODE.ALL_ERROR,
      );
      throw new BadRequestException(error);
    }

    const newCustomer = new this.customerModel({
      ...data,
      ...(data.email ? { email: data.email.toLowerCase() } : {}),
    });

    await newCustomer.save();
    return new APIObjectResponse(newCustomer);
  }

  async findAll() {
    const listCustomer = await this.customerModel
      .find()
      .sort({ createdAt: -1 })
      .exec();

    return new APIListResponse(listCustomer);
  }

  async findOne(id: string) {
    const customer = await this.customerModel.findById(id).exec();

    if (!customer) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.CUSTOMER_NOT_FOUND,
        ERROR_CODE.ALL_ERROR,
      );
      throw new NotFoundException(error);
    }

    return new APIObjectResponse(customer);
  }

  async update(id: string, data: UpdateCustomerDto) {
    const customer = await this.customerModel.findById(id).exec();

    if (!customer) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.CUSTOMER_NOT_FOUND,
        ERROR_CODE.ALL_ERROR,
      );
      throw new NotFoundException(error);
    }

    if (data.phone) {
      const duplicatePhone = await this.customerModel
        .findOne({ _id: { $ne: id }, phone: data.phone })
        .exec();

      if (duplicatePhone) {
        const error = new APIErrorResponse(
          ERROR_MESSAGE.CUSTOMER_ALREADY_EXISTS,
          ERROR_CODE.ALL_ERROR,
        );
        throw new BadRequestException(error);
      }
    }

    const updatedCustomer = await this.customerModel
      .findByIdAndUpdate(
        id,
        {
          ...data,
          ...(data.email ? { email: data.email.toLowerCase() } : {}),
        },
        { new: true, runValidators: true },
      )
      .exec();

    return new APIObjectResponse(updatedCustomer);
  }

  async remove(id: string) {
    const deletedCustomer = await this.customerModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedCustomer) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.CUSTOMER_NOT_FOUND,
        ERROR_CODE.ALL_ERROR,
      );
      throw new NotFoundException(error);
    }

    return new APIObjectResponse(deletedCustomer);
  }
}
