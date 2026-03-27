import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/jwt/jwt.guard';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffService } from './staff.service';

@ApiTags('staffs')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('staffs')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới nhân viên' })
  create(@Body() data: CreateStaffDto) {
    return this.staffService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách nhân viên' })
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin nhân viên theo id' })
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin nhân viên' })
  update(@Param('id') id: string, @Body() data: UpdateStaffDto) {
    return this.staffService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa nhân viên' })
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
