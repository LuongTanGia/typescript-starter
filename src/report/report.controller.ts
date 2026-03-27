import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/jwt/jwt.guard';
import { Roles } from 'src/jwt/roles.decorator';
import { RolesGuard } from 'src/jwt/roles.guard';
import { StaffRole } from 'src/schemas/staff.schema';
import { QueryDashboardDto } from './dto/query-dashboard.dto';
import { ReportService } from './report.service';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('dashboard')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.ACCOUNTANT)
  @ApiOperation({
    summary: 'Lấy số liệu dashboard tổng quan',
    description:
      'grossRevenueInPeriod và collectedRevenueInPeriod được tính theo kỳ lọc; outstandingDebtAllTime là công nợ hiện tại toàn hệ thống; outstandingDebtAtPeriodEnd là công nợ tại thời điểm toDate (hoặc hiện tại nếu không truyền toDate).',
  })
  getDashboard(@Query() query: QueryDashboardDto) {
    return this.reportService.getDashboard(query);
  }
}
