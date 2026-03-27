import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ProductStatus } from 'src/schemas/product.schema';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  @ApiProperty({ example: 'Bàn phím cơ' })
  name: string;

  @IsNotEmpty({ message: 'SKU không được để trống' })
  @IsString({ message: 'SKU phải là chuỗi' })
  @ApiProperty({ example: 'KEYBOARD-001' })
  sku: string;

  @IsNumber({}, { message: 'Giá sản phẩm phải là số' })
  @Min(0, { message: 'Giá sản phẩm không được âm' })
  @ApiProperty({ example: 1299000 })
  price: number;

  @IsNumber({}, { message: 'Tồn kho phải là số' })
  @Min(0, { message: 'Tồn kho không được âm' })
  @ApiProperty({ example: 100 })
  stock: number;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  @ApiPropertyOptional({ example: 'Bàn phím cơ switch đỏ, LED RGB' })
  description?: string;

  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Trạng thái sản phẩm không hợp lệ' })
  @ApiPropertyOptional({ enum: ProductStatus, example: ProductStatus.ACTIVE })
  status?: ProductStatus;
}
