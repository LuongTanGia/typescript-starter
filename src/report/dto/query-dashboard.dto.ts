import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class QueryDashboardDto {
  @IsOptional()
  @IsDateString({}, { message: 'fromDate phải đúng định dạng ISO date' })
  @ApiPropertyOptional({
    example: '2026-03-01T00:00:00.000Z',
    description: 'Thời gian bắt đầu lọc dữ liệu doanh thu/thu tiền',
  })
  fromDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'toDate phải đúng định dạng ISO date' })
  @ApiPropertyOptional({
    example: '2026-03-24T23:59:59.999Z',
    description: 'Thời gian kết thúc lọc dữ liệu doanh thu/thu tiền',
  })
  toDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'lowStockThreshold phải là số nguyên' })
  @Min(0, { message: 'lowStockThreshold không được âm' })
  @ApiPropertyOptional({
    example: 5,
    description: 'Ngưỡng cảnh báo tồn kho thấp',
  })
  lowStockThreshold?: number;
}
