import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true, uppercase: true })
  sku: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  stock: number;

  @Prop({ default: '' })
  description: string;

  @Prop({ enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ sku: 1 }, { unique: true });
ProductSchema.index({ name: 1 });
