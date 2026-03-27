import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Product } from 'src/schemas/product.schema';

export type InventoryTransactionDocument =
  HydratedDocument<InventoryTransaction>;

export enum InventoryTransactionType {
  IMPORT = 'import',
  ADJUSTMENT = 'adjustment',
  SALE = 'sale',
  RETURN = 'return',
}

@Schema({ timestamps: true })
export class InventoryTransaction {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  productId: Types.ObjectId;

  @Prop({ enum: InventoryTransactionType, required: true })
  type: InventoryTransactionType;

  @Prop({ required: true })
  quantityChange: number;

  @Prop({ default: '' })
  note: string;

  @Prop({ default: '' })
  createdBy: string;
}

export const InventoryTransactionSchema =
  SchemaFactory.createForClass(InventoryTransaction);

InventoryTransactionSchema.index({ productId: 1, createdAt: -1 });
