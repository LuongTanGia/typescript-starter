import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/jwt/jwt.guard';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { SalesService } from './sales.service';

@ApiTags('sales')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('orders')
  @ApiOperation({ summary: 'Tạo đơn bán hàng' })
  createOrder(@Body() data: CreateSalesOrderDto) {
    return this.salesService.createOrder(data);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Lấy danh sách đơn bán hàng' })
  findAll() {
    return this.salesService.findAll();
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Lấy chi tiết đơn bán hàng theo id' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }
}
