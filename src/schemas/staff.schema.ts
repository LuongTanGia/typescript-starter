import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StaffDocument = HydratedDocument<Staff>;

export enum StaffRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SALES = 'sales',
  WAREHOUSE = 'warehouse',
  ACCOUNTANT = 'accountant',
}

export enum StaffStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class Staff {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, unique: true, trim: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: StaffRole, default: StaffRole.SALES })
  role: StaffRole;

  @Prop({ enum: StaffStatus, default: StaffStatus.ACTIVE })
  status: StaffStatus;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);

StaffSchema.index({ email: 1 }, { unique: true });
StaffSchema.index({ phone: 1 }, { unique: true });
