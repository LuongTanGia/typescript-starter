import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Customer } from 'src/schemas/customer.schema';

export type DebtLedgerDocument = HydratedDocument<DebtLedger>;

export enum DebtLedgerType {
  INCREASE = 'increase',
  DECREASE = 'decrease',
}

export enum DebtReferenceType {
  SALES_ORDER = 'sales_order',
  RECEIPT = 'receipt',
}

@Schema({ timestamps: true })
export class DebtLedger {
  @Prop({ type: Types.ObjectId, ref: Customer.name, required: true })
  customerId: Types.ObjectId;

  @Prop({ enum: DebtLedgerType, required: true })
  type: DebtLedgerType;

  @Prop({ enum: DebtReferenceType, required: true })
  referenceType: DebtReferenceType;

  @Prop({ required: true })
  referenceId: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ default: '' })
  note: string;
}

export const DebtLedgerSchema = SchemaFactory.createForClass(DebtLedger);

DebtLedgerSchema.index({ customerId: 1, createdAt: -1 });
DebtLedgerSchema.index({ createdAt: -1 });
