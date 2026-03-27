import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AdjustStockDto {
  @IsMongoId({ message: 'productId không hợp lệ' })
  @ApiProperty({ example: '65aaf5d7084e625cbf935a11' })
  productId: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng điều chỉnh phải là số' })
  @ApiProperty({ example: 10, description: 'Có thể âm hoặc dương' })
  quantityChange: number;

  @IsNotEmpty({ message: 'Lý do điều chỉnh không được để trống' })
  @ApiProperty({ example: 'Kiểm kê cuối ngày' })
  reason: string;

  @ApiPropertyOptional({ example: 'admin@store.com' })
  createdBy?: string;
}
