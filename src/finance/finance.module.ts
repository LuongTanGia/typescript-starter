import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from 'src/schemas/customer.schema';
import { DebtLedger, DebtLedgerSchema } from 'src/schemas/debt-ledger.schema';
import {
  FinanceReceipt,
  FinanceReceiptSchema,
} from 'src/schemas/finance-receipt.schema';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: FinanceReceipt.name, schema: FinanceReceiptSchema },
      { name: DebtLedger.name, schema: DebtLedgerSchema },
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}
