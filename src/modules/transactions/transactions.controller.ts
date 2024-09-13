import { Controller, Get, Param, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get(':accountId/history')
  async getFilteredTransactions(
    @Param('accountId') accountId: number,
    @Query('limit') limit: number = 10,
    @Query('page') page?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('transactionType') transactionType?: string,
    @Query('minAmount') minAmount?: number,
    @Query('maxAmount') maxAmount?: number,
    @Query('recipientAccountId') recipientAccountId?: number,
  ) {
    return this.transactionsService.getFilteredTransactions(
      accountId,
      limit,
      page,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      transactionType,
      minAmount,
      maxAmount,
      recipientAccountId,
    );
  }
}
