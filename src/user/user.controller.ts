import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard, type RequestWithUser } from 'src/jwt/jwt.guard';
import { UserDto } from './dto/user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách user' })
  getAll(@Req() req: RequestWithUser) {
    const user = req?.user.sub;
    console.log('req.user', user);
    return this.userService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin user theo id' })
  getOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Post()
  @ApiOperation({ summary: 'Tạo mới user' })
  create(@Body() body: UserDto) {
    return this.userService.createRes(body);
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin user' })
  update(@Param('id') id: string, @Body() body: UserDto) {
    return this.userService.update(id, body);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa user' })
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
