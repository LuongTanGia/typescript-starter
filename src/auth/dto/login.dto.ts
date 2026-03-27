import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class LoginDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @ApiProperty({ example: 'test@gmail.com' })
  email: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
  @MinLength(6, { message: 'Password tối thiểu 6 ký tự' })
  @ApiProperty({ example: '123456' })
  password: string;
}
