import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  InventoryTransaction,
  InventoryTransactionSchema,
} from 'src/schemas/inventory-transaction.schema';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      {
        name: InventoryTransaction.name,
        schema: InventoryTransactionSchema,
      },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
