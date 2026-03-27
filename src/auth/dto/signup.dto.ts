import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignupDto {
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
}
