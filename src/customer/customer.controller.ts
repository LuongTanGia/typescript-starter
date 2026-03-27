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
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới khách hàng' })
  create(@Body() data: CreateCustomerDto) {
    return this.customerService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách khách hàng' })
  findAll() {
    return this.customerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin khách hàng theo id' })
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin khách hàng' })
  update(@Param('id') id: string, @Body() data: UpdateCustomerDto) {
    return this.customerService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa khách hàng' })
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
}
