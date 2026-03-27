import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true })
  phone: string;

  @Prop({ lowercase: true, trim: true })
  email: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: 0, min: 0 })
  loyaltyPoint: number;

  @Prop({ default: 0, min: 0 })
  debtBalance: number;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.index({ phone: 1 }, { unique: true });
CustomerSchema.index({ name: 1 });
