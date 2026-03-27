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
  InventoryTransaction,
  InventoryTransactionDocument,
  InventoryTransactionType,
} from 'src/schemas/inventory-transaction.schema';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import {
  SalesOrder,
  SalesOrderDocument,
  SalesOrderStatus,
} from 'src/schemas/sales-order.schema';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(SalesOrder.name)
    private readonly salesOrderModel: Model<SalesOrderDocument>,
    @InjectModel(InventoryTransaction.name)
    private readonly inventoryTransactionModel: Model<InventoryTransactionDocument>,
    @InjectModel(DebtLedger.name)
    private readonly debtLedgerModel: Model<DebtLedgerDocument>,
  ) {}

  async createOrder(data: CreateSalesOrderDto) {
    const productIds = data.items.map((item) => item.productId);

    const listProduct = await this.productModel
      .find({ _id: { $in: productIds } })
      .exec();

    if (listProduct.length !== productIds.length) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.PRODUCT_NOT_FOUND,
        ERROR_CODE.ALL_ERROR,
      );
      throw new NotFoundException(error);
    }

    let subTotal = 0;

    const orderItems = data.items.map((item) => {
      const product = listProduct.find((row) => row.id === item.productId);

      if (!product) {
        const error = new APIErrorResponse(
          ERROR_MESSAGE.PRODUCT_NOT_FOUND,
          ERROR_CODE.ALL_ERROR,
        );
        throw new NotFoundException(error);
      }

      if (product.stock < item.quantity) {
        const error = new APIErrorResponse(
          ERROR_MESSAGE.INSUFFICIENT_STOCK,
          ERROR_CODE.ALL_ERROR,
        );
        throw new BadRequestException(error);
      }

      const lineTotal = product.price * item.quantity;
      subTotal += lineTotal;

      return {
        productId: new Types.ObjectId(product.id),
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice: product.price,
        lineTotal,
      };
    });

    const discountAmount = data.discountAmount ?? 0;

    if (discountAmount > subTotal) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.INVALID_DISCOUNT,
        ERROR_CODE.ALL_ERROR,
      );
      throw new BadRequestException(error);
    }

    const totalAmount = subTotal - discountAmount;
    const paidAmount = data.paidAmount ?? 0;

    if (paidAmount > totalAmount) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.INVALID_PAID_AMOUNT,
        ERROR_CODE.ALL_ERROR,
      );
      throw new BadRequestException(error);
    }

    let customer: CustomerDocument | null = null;

    if (data.customerId) {
      customer = await this.customerModel.findById(data.customerId).exec();

      if (!customer) {
        const error = new APIErrorResponse(
          ERROR_MESSAGE.CUSTOMER_NOT_FOUND,
          ERROR_CODE.ALL_ERROR,
        );
        throw new NotFoundException(error);
      }
    }

    const debtAmount = totalAmount - paidAmount;

    const orderNo = `SO-${Date.now()}`;

    const newSalesOrder = new this.salesOrderModel({
      orderNo,
      customerId: customer?.id ? new Types.ObjectId(customer.id) : undefined,
      items: orderItems,
      subTotal,
      discountAmount,
      totalAmount,
      paidAmount,
      debtAmount,
      status:
        debtAmount > 0
          ? SalesOrderStatus.PARTIALLY_PAID
          : SalesOrderStatus.COMPLETED,
      createdBy: data.createdBy ?? '',
    });

    await newSalesOrder.save();

    for (const item of orderItems) {
      const product = listProduct.find(
        (row) => row.id === item.productId.toString(),
      );

      if (!product) {
        continue;
      }

      await this.productModel
        .findByIdAndUpdate(product.id, { stock: product.stock - item.quantity })
        .exec();

      const inventoryTx = new this.inventoryTransactionModel({
        productId: item.productId,
        type: InventoryTransactionType.SALE,
        quantityChange: -item.quantity,
        note: `Xuất kho cho đơn ${orderNo}`,
        createdBy: data.createdBy ?? '',
      });

      await inventoryTx.save();
    }

    if (customer && debtAmount > 0) {
      await this.customerModel
        .findByIdAndUpdate(customer.id, {
          debtBalance: customer.debtBalance + debtAmount,
        })
        .exec();

      const debtLedger = new this.debtLedgerModel({
        customerId: new Types.ObjectId(customer.id),
        type: DebtLedgerType.INCREASE,
        referenceType: DebtReferenceType.SALES_ORDER,
        referenceId: newSalesOrder.id,
        amount: debtAmount,
        note: `Ghi nhận công nợ từ đơn ${orderNo}`,
      });

      await debtLedger.save();
    }

    return new APIObjectResponse(newSalesOrder);
  }

  async findAll() {
    const listOrder = await this.salesOrderModel
      .find()
      .sort({ createdAt: -1 })
      .exec();

    return new APIListResponse(listOrder);
  }

  async findOne(id: string) {
    const order = await this.salesOrderModel.findById(id).exec();

    if (!order) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.SALES_ORDER_NOT_FOUND,
        ERROR_CODE.ALL_ERROR,
      );
      throw new NotFoundException(error);
    }

    return new APIObjectResponse(order);
  }
}
