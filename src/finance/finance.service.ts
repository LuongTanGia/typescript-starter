import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ERROR_CODE } from 'src/common/constants/error-code.constant';
import { ERROR_MESSAGE } from 'src/common/constants/error-message.constant';
import {
  APIErrorResponse,
  APIListResponse,
  APIObjectResponse,
} from 'src/common/interfaces/api-response.interface';
import { Customer, CustomerDocument } from 'src/schemas/customer.schema';
import {
  DebtLedger,
  DebtLedgerDocument,
  DebtLedgerType,
  DebtReferenceType,
} from 'src/schemas/debt-ledger.schema';
import {
  FinanceReceipt,
  FinanceReceiptDocument,
} from 'src/schemas/finance-receipt.schema';
import { CreateReceiptDto } from './dto/create-receipt.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(FinanceReceipt.name)
    private readonly financeReceiptModel: Model<FinanceReceiptDocument>,
    @InjectModel(DebtLedger.name)
    private readonly debtLedgerModel: Model<DebtLedgerDocument>,
  ) {}

  async createReceipt(data: CreateReceiptDto) {
    const customer = await this.customerModel.findById(data.customerId).exec();

    if (!customer) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.CUSTOMER_NOT_FOUND,
        ERROR_CODE.ALL_ERROR,
      );
      throw new NotFoundException(error);
    }

    if (data.amount <= 0) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.INVALID_RECEIPT_AMOUNT,
        ERROR_CODE.ALL_ERROR,
      );
      throw new BadRequestException(error);
    }

    if (data.amount > customer.debtBalance) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.RECEIPT_EXCEEDS_DEBT,
        ERROR_CODE.ALL_ERROR,
      );
      throw new BadRequestException(error);
    }

    const receipt = new this.financeReceiptModel({
      customerId: new Types.ObjectId(customer.id),
      salesOrderId: data.salesOrderId
        ? new Types.ObjectId(data.salesOrderId)
        : undefined,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      note: data.note ?? '',
      createdBy: data.createdBy ?? '',
    });

    await receipt.save();

    const updatedCustomer = await this.customerModel
      .findByIdAndUpdate(
        customer.id,
        { debtBalance: customer.debtBalance - data.amount },
        { new: true },
      )
      .exec();

    const debtLedger = new this.debtLedgerModel({
      customerId: new Types.ObjectId(customer.id),
      type: DebtLedgerType.DECREASE,
      referenceType: DebtReferenceType.RECEIPT,
      referenceId: receipt.id,
      amount: data.amount,
      note: `Thu công nợ từ khách hàng ${customer.phone}`,
    });

    await debtLedger.save();

    return new APIObjectResponse({
      receipt,
      customer: updatedCustomer,
    });
  }

  async getReceivableDebts() {
    const listCustomerDebt = await this.customerModel
      .find({ debtBalance: { $gt: 0 } })
      .sort({ debtBalance: -1 })
      .exec();

    return new APIListResponse(listCustomerDebt);
  }
}
