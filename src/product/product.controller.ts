import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/jwt/jwt.guard';
import { ProductService } from 'src/product/product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới sản phẩm' })
  create(@Body() data: CreateProductDto) {
    return this.productService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm' })
  findAll(@Query() query: QueryProductDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm theo id' })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin sản phẩm' })
  update(@Param('id') id: string, @Body() data: UpdateProductDto) {
    return this.productService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sản phẩm' })
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
