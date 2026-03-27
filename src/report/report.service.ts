import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ERROR_CODE } from 'src/common/constants/error-code.constant';
import { ERROR_MESSAGE } from 'src/common/constants/error-message.constant';
import {
  APIErrorResponse,
  APIObjectResponse,
} from 'src/common/interfaces/api-response.interface';
import { Customer, CustomerDocument } from 'src/schemas/customer.schema';
import {
  DebtLedger,
  DebtLedgerDocument,
  DebtLedgerType,
} from 'src/schemas/debt-ledger.schema';
import {
  FinanceReceipt,
  FinanceReceiptDocument,
} from 'src/schemas/finance-receipt.schema';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { SalesOrder, SalesOrderDocument } from 'src/schemas/sales-order.schema';
import { Staff, StaffDocument } from 'src/schemas/staff.schema';
import { QueryDashboardDto } from './dto/query-dashboard.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(Staff.name)
    private readonly staffModel: Model<StaffDocument>,
    @InjectModel(SalesOrder.name)
    private readonly salesOrderModel: Model<SalesOrderDocument>,
    @InjectModel(FinanceReceipt.name)
    private readonly financeReceiptModel: Model<FinanceReceiptDocument>,
    @InjectModel(DebtLedger.name)
    private readonly debtLedgerModel: Model<DebtLedgerDocument>,
  ) {}

  async getDashboard(query: QueryDashboardDto) {
    const { fromDate, toDate } = query;

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      const error = new APIErrorResponse(
        ERROR_MESSAGE.INVALID_DATE_RANGE,
        ERROR_CODE.ALL_ERROR,
      );
      throw new BadRequestException(error);
    }

    const periodFilter = {
      ...(fromDate || toDate
        ? {
            createdAt: {
              ...(fromDate ? { $gte: new Date(fromDate) } : {}),
              ...(toDate ? { $lte: new Date(toDate) } : {}),
            },
          }
        : {}),
    };

    const envLowStockThreshold = Number(process.env.LOW_STOCK_THRESHOLD);
    const defaultLowStockThreshold = Number.isNaN(envLowStockThreshold)
      ? 5
      : envLowStockThreshold;
    const lowStockThreshold = Math.max(
      0,
      query.lowStockThreshold ?? defaultLowStockThreshold,
    );

    const periodEndFilter = {
      ...(toDate
        ? {
            createdAt: {
              $lte: new Date(toDate),
            },
          }
        : {}),
    };

    const [
      productCount,
      customerCount,
      staffCount,
      orderCountInPeriod,
      grossRevenueResult,
      collectedRevenueResult,
      outstandingDebtAllTimeResult,
      outstandingDebtAtPeriodEndResult,
      periodDebtFlowResult,
      lowStockCount,
    ] = await Promise.all([
      this.productModel.countDocuments().exec(),
      this.customerModel.countDocuments().exec(),
      this.staffModel.countDocuments().exec(),
      this.salesOrderModel.countDocuments(periodFilter).exec(),
      this.salesOrderModel
        .aggregate<{ totalRevenue: number }>([
          ...(fromDate || toDate ? [{ $match: periodFilter }] : []),
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$totalAmount' },
            },
          },
        ])
        .exec(),
      this.financeReceiptModel
        .aggregate<{ totalCollected: number }>([
          ...(fromDate || toDate ? [{ $match: periodFilter }] : []),
          {
            $group: {
              _id: null,
              totalCollected: { $sum: '$amount' },
            },
          },
        ])
        .exec(),
      this.debtLedgerModel
        .aggregate<{
          outstandingDebt: number;
        }>(this.buildOutstandingDebtAggregation())
        .exec(),
      this.debtLedgerModel
        .aggregate<{
          outstandingDebt: number;
        }>(
          this.buildOutstandingDebtAggregation(toDate ? periodEndFilter : null),
        )
        .exec(),
      this.debtLedgerModel
        .aggregate<{
          periodDebtIncurred: number;
          periodDebtCollected: number;
        }>([
          ...(fromDate || toDate ? [{ $match: periodFilter }] : []),
          {
            $group: {
              _id: null,
              periodDebtIncurred: {
                $sum: {
                  $cond: [
                    { $eq: ['$type', DebtLedgerType.INCREASE] },
                    '$amount',
                    0,
                  ],
                },
              },
              periodDebtCollected: {
                $sum: {
                  $cond: [
                    { $eq: ['$type', DebtLedgerType.DECREASE] },
                    '$amount',
                    0,
                  ],
                },
              },
            },
          },
        ])
        .exec(),
      this.productModel
        .countDocuments({ stock: { $lte: lowStockThreshold } })
        .exec(),
    ]);

    return new APIObjectResponse({
      period: {
        fromDate: fromDate ?? null,
        toDate: toDate ?? null,
      },
      productCount,
      customerCount,
      staffCount,
      orderCountInPeriod,
      grossRevenueInPeriod: grossRevenueResult[0]?.totalRevenue ?? 0,
      collectedRevenueInPeriod: collectedRevenueResult[0]?.totalCollected ?? 0,
      outstandingDebtAllTime:
        outstandingDebtAllTimeResult[0]?.outstandingDebt ?? 0,
      outstandingDebtAtPeriodEnd:
        outstandingDebtAtPeriodEndResult[0]?.outstandingDebt ?? 0,
      periodDebtIncurred: periodDebtFlowResult[0]?.periodDebtIncurred ?? 0,
      periodDebtCollected: periodDebtFlowResult[0]?.periodDebtCollected ?? 0,
      lowStockThreshold,
      lowStockCount,
    });
  }

  private buildOutstandingDebtAggregation(matchFilter?: object | null) {
    return [
      ...(matchFilter ? [{ $match: matchFilter }] : []),
      {
        $group: {
          _id: null,
          debtIncrease: {
            $sum: {
              $cond: [
                { $eq: ['$type', DebtLedgerType.INCREASE] },
                '$amount',
                0,
              ],
            },
          },
          debtDecrease: {
            $sum: {
              $cond: [
                { $eq: ['$type', DebtLedgerType.DECREASE] },
                '$amount',
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          outstandingDebt: {
            $subtract: ['$debtIncrease', '$debtDecrease'],
          },
        },
      },
    ];
  }
}
