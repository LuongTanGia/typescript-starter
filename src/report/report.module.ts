import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from 'src/schemas/customer.schema';
import { DebtLedger, DebtLedgerSchema } from 'src/schemas/debt-ledger.schema';
import {
  FinanceReceipt,
  FinanceReceiptSchema,
} from 'src/schemas/finance-receipt.schema';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { SalesOrder, SalesOrderSchema } from 'src/schemas/sales-order.schema';
import { Staff, StaffSchema } from 'src/schemas/staff.schema';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Staff.name, schema: StaffSchema },
      { name: SalesOrder.name, schema: SalesOrderSchema },
      { name: FinanceReceipt.name, schema: FinanceReceiptSchema },
      { name: DebtLedger.name, schema: DebtLedgerSchema },
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
