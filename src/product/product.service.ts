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
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ProductSortBy,
  QueryProductDto,
  SortOrder,
} from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(data: CreateProductDto) {
    const existingProduct = await this.productModel
      .findOne({ sku: data.sku.toUpperCase() })
      .exec();

    if (existingProduct) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.PRODUCT_ALREADY_EXISTS,
        ERROR_CODE.ALL_ERROR,
      );
      throw new BadRequestException(error);
    }

    const newProduct = new this.productModel({
      ...data,
      sku: data.sku.toUpperCase(),
    });

    await newProduct.save();

    return new APIObjectResponse(newProduct);
  }

  async findAll(query: QueryProductDto) {
    const {
      page,
      limit,
      search,
      status,
      minPrice,
      maxPrice,
      sortBy = ProductSortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
    } = query;

    const sortDirection = sortOrder === SortOrder.ASC ? 1 : -1;

    let modelQuery = this.productModel.find();

    if (search) {
      modelQuery = modelQuery.or([
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ]);
    }

    if (status) {
      modelQuery = modelQuery.where('status').equals(status);
    }

    if (minPrice !== undefined) {
      modelQuery = modelQuery.where('price').gte(minPrice);
    }

    if (maxPrice !== undefined) {
      modelQuery = modelQuery.where('price').lte(maxPrice);
    }

    modelQuery = modelQuery.sort({ [sortBy]: sortDirection });

    if (page && limit) {
      modelQuery = modelQuery.skip((page - 1) * limit).limit(limit);
    }

    const listProduct = await modelQuery.exec();
    return new APIListResponse(listProduct);
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.PRODUCT_NOT_FOUND,
        ERROR_CODE.ALL_ERROR,
      );
      throw new NotFoundException(error);
    }

    return new APIObjectResponse(product);
  }

  async update(id: string, data: UpdateProductDto) {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.PRODUCT_NOT_FOUND,
        ERROR_CODE.ALL_ERROR,
      );
      throw new NotFoundException(error);
    }

    if (data.sku) {
      const existedSkuProduct = await this.productModel
        .findOne({ sku: data.sku.toUpperCase() })
        .exec();

      if (existedSkuProduct && existedSkuProduct.id !== id) {
        const error = new APIErrorResponse(
          ERROR_MESSAGE.PRODUCT_ALREADY_EXISTS,
          ERROR_CODE.ALL_ERROR,
        );
        throw new BadRequestException(error);
      }
    }

    const updateProduct = await this.productModel
      .findByIdAndUpdate(
        id,
        {
          ...data,
          ...(data.sku ? { sku: data.sku.toUpperCase() } : {}),
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();

    return new APIObjectResponse(updateProduct);
  }

  async remove(id: string) {
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();

    if (!deletedProduct) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.PRODUCT_NOT_FOUND,
        ERROR_CODE.ALL_ERROR,
      );
      throw new NotFoundException(error);
    }

    return new APIObjectResponse(deletedProduct);
  }
}
