import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from 'src/schemas/customer.schema';
import { DebtLedger, DebtLedgerSchema } from 'src/schemas/debt-ledger.schema';
import {
  InventoryTransaction,
  InventoryTransactionSchema,
} from 'src/schemas/inventory-transaction.schema';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { SalesOrder, SalesOrderSchema } from 'src/schemas/sales-order.schema';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: SalesOrder.name, schema: SalesOrderSchema },
      {
        name: InventoryTransaction.name,
        schema: InventoryTransactionSchema,
      },
      { name: DebtLedger.name, schema: DebtLedgerSchema },
    ]),
  ],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
