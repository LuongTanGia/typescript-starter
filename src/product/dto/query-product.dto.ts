import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ProductStatus } from 'src/schemas/product.schema';

export enum ProductSortBy {
  CREATED_AT = 'createdAt',
  PRICE = 'price',
  NAME = 'name',
  STOCK = 'stock',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryProductDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page phải là số nguyên' })
  @Min(1, { message: 'Page tối thiểu là 1' })
  @ApiPropertyOptional({ example: 1 })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit phải là số nguyên' })
  @Min(1, { message: 'Limit tối thiểu là 1' })
  @Max(100, { message: 'Limit tối đa là 100' })
  @ApiPropertyOptional({ example: 10 })
  limit?: number;

  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
  @ApiPropertyOptional({ example: 'ban phim' })
  search?: string;

  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Trạng thái sản phẩm không hợp lệ' })
  @ApiPropertyOptional({ enum: ProductStatus, example: ProductStatus.ACTIVE })
  status?: ProductStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Giá tối thiểu phải là số' })
  @Min(0, { message: 'Giá tối thiểu không được âm' })
  @ApiPropertyOptional({ example: 100000 })
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Giá tối đa phải là số' })
  @Min(0, { message: 'Giá tối đa không được âm' })
  @ApiPropertyOptional({ example: 5000000 })
  maxPrice?: number;

  @IsOptional()
  @IsEnum(ProductSortBy, { message: 'Trường sắp xếp không hợp lệ' })
  @ApiPropertyOptional({
    enum: ProductSortBy,
    example: ProductSortBy.CREATED_AT,
  })
  sortBy?: ProductSortBy;

  @IsOptional()
  @IsEnum(SortOrder, { message: 'Chiều sắp xếp không hợp lệ' })
  @ApiPropertyOptional({ enum: SortOrder, example: SortOrder.DESC })
  sortOrder?: SortOrder;
}
