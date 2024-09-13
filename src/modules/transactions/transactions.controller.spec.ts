import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let transactionsService: TransactionsService;

  const mockTransactionsService = {
    getFilteredTransactions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    transactionsService = module.get<TransactionsService>(TransactionsService);
  });

  describe('getFilteredTransactions', () => {
    it('should call the service with the correct parameters', async () => {
      const accountId = 1;
      const limit = 10;
      const page = 1;
      const startDate = '2023-01-01';
      const endDate = '2023-12-31';
      const transactionType = 'deposit';
      const minAmount = 100;
      const maxAmount = 500;
      const recipientAccountId = 2;

      await controller.getFilteredTransactions(
        accountId,
        limit,
        page,
        startDate,
        endDate,
        transactionType,
        minAmount,
        maxAmount,
        recipientAccountId,
      );

      expect(transactionsService.getFilteredTransactions).toHaveBeenCalledWith(
        accountId,
        limit,
        page,
        new Date(startDate),
        new Date(endDate),
        transactionType,
        minAmount,
        maxAmount,
        recipientAccountId,
      );
    });

    it('should handle undefined optional query parameters', async () => {
      const accountId = 1;
      const limit = 10;

      await controller.getFilteredTransactions(accountId, limit);

      expect(transactionsService.getFilteredTransactions).toHaveBeenCalledWith(
        accountId,
        limit,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });
  });
});
