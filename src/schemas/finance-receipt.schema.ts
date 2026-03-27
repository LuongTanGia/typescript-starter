import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Customer } from 'src/schemas/customer.schema';
import { SalesOrder } from 'src/schemas/sales-order.schema';

export type FinanceReceiptDocument = HydratedDocument<FinanceReceipt>;

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  E_WALLET = 'e_wallet',
}

@Schema({ timestamps: true })
export class FinanceReceipt {
  @Prop({ type: Types.ObjectId, ref: Customer.name, required: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: SalesOrder.name })
  salesOrderId?: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ enum: PaymentMethod, required: true })
  paymentMethod: PaymentMethod;

  @Prop({ default: '' })
  note: string;

  @Prop({ default: '' })
  createdBy: string;
}

export const FinanceReceiptSchema =
  SchemaFactory.createForClass(FinanceReceipt);

FinanceReceiptSchema.index({ customerId: 1, createdAt: -1 });
FinanceReceiptSchema.index({ createdAt: -1 });
