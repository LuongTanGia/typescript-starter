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
import {
  InventoryTransaction,
  InventoryTransactionDocument,
  InventoryTransactionType,
} from 'src/schemas/inventory-transaction.schema';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(InventoryTransaction.name)
    private readonly inventoryTransactionModel: Model<InventoryTransactionDocument>,
  ) {}

  async getStockOnHand() {
    const listProduct = await this.productModel
      .find()
      .select('name sku stock price status')
      .sort({ updatedAt: -1 })
      .exec();

    return new APIListResponse(listProduct);
  }

  async adjustStock(data: AdjustStockDto) {
    if (data.quantityChange === 0) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.INVALID_STOCK_ADJUSTMENT,
        ERROR_CODE.ALL_ERROR,
      );
      throw new BadRequestException(error);
    }

    const product = await this.productModel.findById(data.productId).exec();

    if (!product) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.PRODUCT_NOT_FOUND,
        ERROR_CODE.ALL_ERROR,
      );
      throw new NotFoundException(error);
    }

    const nextStock = product.stock + data.quantityChange;

    if (nextStock < 0) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.INSUFFICIENT_STOCK,
        ERROR_CODE.ALL_ERROR,
      );
      throw new BadRequestException(error);
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        product.id,
        { stock: nextStock },
        { new: true, runValidators: true },
      )
      .exec();

    const transaction = new this.inventoryTransactionModel({
      productId: new Types.ObjectId(product.id),
      type:
        data.quantityChange > 0
          ? InventoryTransactionType.IMPORT
          : InventoryTransactionType.ADJUSTMENT,
      quantityChange: data.quantityChange,
      note: data.reason,
      createdBy: data.createdBy ?? '',
    });

    await transaction.save();

    return new APIObjectResponse({
      product: updatedProduct,
      transaction,
    });
  }
}
