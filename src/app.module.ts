import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { ProductModule } from './product/product.module';
import { StaffModule } from './staff/staff.module';
import { CustomerModule } from './customer/customer.module';
import { InventoryModule } from './inventory/inventory.module';
import { SalesModule } from './sales/sales.module';
import { FinanceModule } from './finance/finance.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'dev_jwt_secret_change_me',
      signOptions: { expiresIn: '15m' },
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ??
        'mongodb+srv://devluong:Gia08042001@cluster0.b9n1d0o.mongodb.net/',
    ),
    AuthModule,
    ProductModule,
    StaffModule,
    CustomerModule,
    InventoryModule,
    SalesModule,
    FinanceModule,
    ReportModule,
  ],
})
export class AppModule {}
