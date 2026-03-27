import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @ApiProperty({ example: 'test@gmail.com' })
  email: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
  @MinLength(6, { message: 'Password tối thiểu 6 ký tự' })
  @ApiProperty({ example: '123456' })
  password: string;

  @IsNotEmpty({ message: 'Name không được để trống' })
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @IsNotEmpty({ message: 'Age không được để trống' })
  @ApiProperty({ example: 25 })
  age: number;
}
