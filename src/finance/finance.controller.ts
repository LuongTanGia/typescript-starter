import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/jwt/jwt.guard';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { FinanceService } from './finance.service';

@ApiTags('finance')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('receipts')
  @ApiOperation({ summary: 'Tạo phiếu thu công nợ' })
  createReceipt(@Body() data: CreateReceiptDto) {
    return this.financeService.createReceipt(data);
  }

  @Get('debts/receivable')
  @ApiOperation({ summary: 'Lấy danh sách công nợ phải thu' })
  getReceivableDebts() {
    return this.financeService.getReceivableDebts();
  }
}
