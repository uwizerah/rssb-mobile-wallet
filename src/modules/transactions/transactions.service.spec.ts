import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { Account } from '../accounts/account.entity';
import { Repository } from 'typeorm';
import { DepositDto, WithdrawDto, TransferDto } from '../accounts/dto';
import { TransactionType } from './transaction-type.enum';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionRepository: Repository<Transaction>;
  let accountRepository: Repository<Account>;

  beforeEach(async () => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Account),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
    accountRepository = module.get<Repository<Account>>(
      getRepositoryToken(Account),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deposit', () => {
    it('should deposit money into an account', async () => {
      const account = new Account();
      account.id = 1;
      account.balance = 1000;

      const depositDto: DepositDto = { amount: 500 };

      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(account);
      jest.spyOn(accountRepository, 'save').mockResolvedValue(account);
      jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(new Transaction());

      const result = await service.deposit(account.id, depositDto);

      expect(account.balance).toBe(1500);
      expect(result).toBeInstanceOf(Transaction);
    });
  });

  describe('withdraw', () => {
    it('should withdraw money from an account', async () => {
      const account = new Account();
      account.id = 1;
      account.balance = 1000;

      const withdrawDto: WithdrawDto = { amount: 500 };

      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(account);
      jest.spyOn(accountRepository, 'save').mockResolvedValue(account);
      jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(new Transaction());

      const result = await service.withdraw(account.id, withdrawDto);

      expect(account.balance).toBe(500);
      expect(result).toBeInstanceOf(Transaction);
    });

    it('should throw an error if account balance is insufficient', async () => {
      const account = new Account();
      account.id = 1;
      account.balance = 200;

      const withdrawDto: WithdrawDto = { amount: 500 };

      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(account);

      await expect(service.withdraw(account.id, withdrawDto)).rejects.toThrow(
        'Insufficient balance',
      );
    });
  });

  describe('transfer', () => {
    it('should transfer money between accounts', async () => {
      const senderAccount = new Account();
      senderAccount.id = 1;
      senderAccount.balance = 1000;

      const recipientAccount = new Account();
      recipientAccount.id = 2;
      recipientAccount.balance = 500;

      const transferDto: TransferDto = {
        amount: 300,
        recipientAccountId: recipientAccount.id,
      };

      jest
        .spyOn(accountRepository, 'findOne')
        .mockResolvedValueOnce(senderAccount)
        .mockResolvedValueOnce(recipientAccount);

      jest.spyOn(accountRepository, 'save').mockResolvedValue(senderAccount);
      jest
        .spyOn(transactionRepository, 'create')
        .mockReturnValue(new Transaction());
      jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(new Transaction());

      const result = await service.transfer(senderAccount.id, transferDto);

      expect(senderAccount.balance).toBe(700);
      expect(recipientAccount.balance).toBe(800);
      expect(result).toBeInstanceOf(Transaction);
    });

    it('should throw an error if sender account balance is insufficient', async () => {
      const senderAccount = new Account();
      senderAccount.id = 1;
      senderAccount.balance = 100;

      const recipientAccount = new Account();
      recipientAccount.id = 2;
      recipientAccount.balance = 500;

      const transferDto: TransferDto = {
        amount: 300,
        recipientAccountId: recipientAccount.id,
      };

      jest
        .spyOn(accountRepository, 'findOne')
        .mockResolvedValueOnce(senderAccount)
        .mockResolvedValueOnce(recipientAccount);

      await expect(
        service.transfer(senderAccount.id, transferDto),
      ).rejects.toThrow('Insufficient balance');
    });
  });

  describe('getFilteredTransactions', () => {
    it('should return filtered transactions', async () => {
      const account = new Account();
      account.id = 1;

      const mockTransactions = [
        {
          id: 1,
          account: account,
          amount: 100,
          transactionType: TransactionType.DEPOSIT,
          createdAt: new Date(),
        } as Transaction,
      ];

      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(account);
      jest.spyOn(transactionRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTransactions),
      } as any);

      const result = await service.getFilteredTransactions(account.id, 10, 1);
      expect(result).toEqual(mockTransactions);
    });

    it('should handle pagination correctly', async () => {
      const account = new Account();
      account.id = 1;

      const mockTransactions = [{ id: 1, amount: 100 }] as Transaction[];

      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(account);
      jest.spyOn(transactionRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn((skip: number) => expect(skip).toBe(10)).mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTransactions),
      } as any);

      await service.getFilteredTransactions(account.id, 10, 2);
    });

    it('should apply filters for transactionType', async () => {
      const account = new Account();
      account.id = 1;

      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(account);
      jest.spyOn(transactionRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn((condition: string) => {
          expect(condition).toContain(
            'transaction.transactionType = :transactionType',
          );
          return this;
        }),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as any);

      await service.getFilteredTransactions(
        account.id,
        10,
        1,
        undefined,
        undefined,
        'deposit',
      );
    });

    it('should throw an error if the account is not found', async () => {
      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getFilteredTransactions(999, 10, 1)).rejects.toThrow(
        'Account not found',
      );
    });
  });
});
