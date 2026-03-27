import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/jwt/jwt.guard';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { InventoryService } from './inventory.service';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stock-on-hand')
  @ApiOperation({ summary: 'Lấy tồn kho hiện tại' })
  getStockOnHand() {
    return this.inventoryService.getStockOnHand();
  }

  @Post('adjustments')
  @ApiOperation({ summary: 'Điều chỉnh tồn kho' })
  adjustStock(@Body() data: AdjustStockDto) {
    return this.inventoryService.adjustStock(data);
  }
}
