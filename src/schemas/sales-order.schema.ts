import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Customer } from 'src/schemas/customer.schema';
import { Product } from 'src/schemas/product.schema';

export type SalesOrderDocument = HydratedDocument<SalesOrder>;

export enum SalesOrderStatus {
  COMPLETED = 'completed',
  PARTIALLY_PAID = 'partially_paid',
}

@Schema({ _id: false })
export class SalesOrderItem {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  sku: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 0 })
  lineTotal: number;
}

@Schema({ timestamps: true })
export class SalesOrder {
  @Prop({ required: true, unique: true })
  orderNo: string;

  @Prop({ type: Types.ObjectId, ref: Customer.name })
  customerId?: Types.ObjectId;

  @Prop({ type: [SalesOrderItem], default: [] })
  items: SalesOrderItem[];

  @Prop({ required: true, min: 0 })
  subTotal: number;

  @Prop({ required: true, min: 0, default: 0 })
  discountAmount: number;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ required: true, min: 0, default: 0 })
  paidAmount: number;

  @Prop({ required: true, min: 0, default: 0 })
  debtAmount: number;

  @Prop({ enum: SalesOrderStatus, required: true })
  status: SalesOrderStatus;

  @Prop({ default: '' })
  createdBy: string;
}

export const SalesOrderSchema = SchemaFactory.createForClass(SalesOrder);

SalesOrderSchema.index({ orderNo: 1 }, { unique: true });
SalesOrderSchema.index({ customerId: 1, createdAt: -1 });
SalesOrderSchema.index({ createdAt: -1 });
