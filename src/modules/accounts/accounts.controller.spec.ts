import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { TransactionsService } from '../transactions/transactions.service';
import { AccountType } from './account-type.enum';

describe('AccountsController', () => {
  let controller: AccountsController;
  let accountsService: AccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        {
          provide: AccountsService,
          useValue: {
            createAccount: jest.fn(),
            getBalance: jest.fn(),
          },
        },
        {
          provide: TransactionsService,
          useValue: {
            deposit: jest.fn(),
            withdraw: jest.fn(),
            transfer: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
    accountsService = module.get<AccountsService>(AccountsService);
  });

  describe('createAccount', () => {
    it('should create a new account', async () => {
      const mockAccount = { id: 1, accountType: AccountType.PERSONAL };
      jest
        .spyOn(accountsService, 'createAccount')
        .mockResolvedValue(mockAccount as any);

      const result = await controller.createAccount(
        { user: { id: 1 } },
        { accountType: AccountType.PERSONAL },
      );
      expect(result).toEqual(mockAccount);
    });
  });

  describe('getBalance', () => {
    it('should return account balance', async () => {
      const mockBalance = { balance: 100 };
      jest.spyOn(accountsService, 'getBalance').mockResolvedValue(mockBalance);

      const result = await controller.getBalance(1);
      expect(result).toEqual(mockBalance);
    });
  });
});
