import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';
import { StaffRole, StaffStatus } from 'src/schemas/staff.schema';

export class CreateStaffDto {
  @IsNotEmpty({ message: 'Tên nhân viên không được để trống' })
  @ApiProperty({ example: 'Nguyễn Văn A' })
  name: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @ApiProperty({ example: 'staff01@store.com' })
  email: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @ApiProperty({ example: '0909123456' })
  phone: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
  @MinLength(6, { message: 'Password tối thiểu 6 ký tự' })
  @ApiProperty({ example: '123456' })
  password: string;

  @IsOptional()
  @IsEnum(StaffRole, { message: 'Vai trò không hợp lệ' })
  @ApiPropertyOptional({ enum: StaffRole, example: StaffRole.SALES })
  role?: StaffRole;

  @IsOptional()
  @IsEnum(StaffStatus, { message: 'Trạng thái không hợp lệ' })
  @ApiPropertyOptional({ enum: StaffStatus, example: StaffStatus.ACTIVE })
  status?: StaffStatus;
}
