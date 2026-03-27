import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCustomerDto {
  @IsNotEmpty({ message: 'Tên khách hàng không được để trống' })
  @ApiProperty({ example: 'Trần Thị B' })
  name: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @ApiProperty({ example: '0911222333' })
  phone: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @ApiPropertyOptional({ example: 'customer01@gmail.com' })
  email?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'Quận 1, TP.HCM' })
  address?: string;
}
