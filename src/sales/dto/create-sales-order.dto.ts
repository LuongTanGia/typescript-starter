import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateSalesOrderItemDto {
  @IsMongoId({ message: 'productId không hợp lệ' })
  @ApiProperty({ example: '65aaf5d7084e625cbf935a11' })
  productId: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  @ApiProperty({ example: 2 })
  quantity: number;
}

export class CreateSalesOrderDto {
  @IsOptional()
  @IsMongoId({ message: 'customerId không hợp lệ' })
  @ApiPropertyOptional({ example: '65aaf5d7084e625cbf935a22' })
  customerId?: string;

  @IsArray({ message: 'Danh sách sản phẩm phải là mảng' })
  @ArrayMinSize(1, { message: 'Đơn hàng phải có ít nhất 1 sản phẩm' })
  @ValidateNested({ each: true })
  @Type(() => CreateSalesOrderItemDto)
  @ApiProperty({ type: [CreateSalesOrderItemDto] })
  items: CreateSalesOrderItemDto[];

  @Type(() => Number)
  @IsNumber({}, { message: 'Giảm giá phải là số' })
  @Min(0, { message: 'Giảm giá không được âm' })
  @ApiPropertyOptional({ example: 10000, default: 0 })
  discountAmount?: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Số tiền khách thanh toán phải là số' })
  @Min(0, { message: 'Số tiền khách thanh toán không được âm' })
  @ApiPropertyOptional({ example: 50000, default: 0 })
  paidAmount?: number;

  @IsOptional()
  @IsNotEmpty({ message: 'Người tạo đơn không được để trống' })
  @ApiPropertyOptional({ example: 'sales@store.com' })
  createdBy?: string;
}
