import { Type } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from 'src/schemas/finance-receipt.schema';

export class CreateReceiptDto {
  @IsMongoId({ message: 'customerId không hợp lệ' })
  @ApiProperty({ example: '65aaf5d7084e625cbf935a22' })
  customerId: string;

  @IsOptional()
  @IsMongoId({ message: 'salesOrderId không hợp lệ' })
  @ApiPropertyOptional({ example: '65aaf5d7084e625cbf935a33' })
  salesOrderId?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Số tiền thu phải là số' })
  @Min(0, { message: 'Số tiền thu không được âm' })
  @ApiProperty({ example: 200000 })
  amount: number;

  @IsEnum(PaymentMethod, { message: 'Phương thức thanh toán không hợp lệ' })
  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsNotEmpty({ message: 'Ghi chú không hợp lệ' })
  @ApiPropertyOptional({ example: 'Thu công nợ đơn cũ' })
  note?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'accountant@store.com' })
  createdBy?: string;
}
