import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionsService } from './transactions.service';
import { Transaction } from './transaction.entity';
import { Account } from '../accounts/account.entity';
import { DepositDto, WithdrawDto, TransferDto } from '../accounts/dto';
import { NotificationService } from '../notification/notification.service';
import { PdfService } from '../../utils/pdf.service';
import { Response } from 'express';
import { TransactionType } from './transaction-type.enum';
import { AccountType } from '../accounts/account-type.enum';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionRepository: Repository<Transaction>;
  let accountRepository: Repository<Account>;
  let notificationService: NotificationService;
  let pdfService: PdfService;
  let mockManager: any;
  let res: Response;

  beforeEach(async () => {
    mockManager = {
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }),
      create: jest.fn(),
    };

    const transactionMock = jest.fn().mockImplementation(async (cb: any) => {
      return cb(mockManager);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            manager: {
              transaction: transactionMock,
            },
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Account),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
        {
          provide: PdfService,
          useValue: {
            generateAccountStatement: jest.fn(),
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
    notificationService = module.get<NotificationService>(NotificationService);
    pdfService = module.get<PdfService>(PdfService);
    res = {
      set: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deposit', () => {
    it('should deposit money and send a notification', async () => {
      const account = {
        id: 1,
        balance: BigInt(1000),
        user: { email: 'test@example.com', id: 1 },
      } as Account;

      const depositDto: DepositDto = { amount: BigInt(500) };

      mockManager.findOne.mockResolvedValue(account);

      mockManager.save.mockResolvedValue(account);

      const result = await service.deposit(1, depositDto);

      expect(account.balance).toBe(BigInt(1500));
      expect(result).toBeDefined();
      expect(notificationService.sendEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Deposit Successful',
        'You have successfully deposited 500. Your new balance is 1500.',
      );
    });

    it('should throw an error if account is not found during deposit', async () => {
      mockManager.findOne.mockResolvedValue(null);

      await expect(service.deposit(1, { amount: BigInt(500) })).rejects.toThrow(
        'Account not found',
      );
    });
  });

  describe('withdraw', () => {
    it('should withdraw money and send a notification', async () => {
      const account = {
        id: 1,
        balance: BigInt(1000),
        user: { email: 'test@example.com' },
      } as Account;
      const withdrawDto: WithdrawDto = { amount: BigInt(500) };

      mockManager.findOne.mockResolvedValue(account);
      mockManager.save.mockResolvedValue(account);

      const result = await service.withdraw(1, withdrawDto);

      expect(account.balance).toBe(BigInt(500));
      expect(result).toBeDefined();
      expect(notificationService.sendEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Withdrawal Successful',
        'You have successfully withdrawn 500. Your new balance is 500.',
      );
    });

    it('should throw an error if balance is insufficient during withdrawal', async () => {
      const account = {
        id: 1,
        balance: BigInt(200),
        user: { email: 'test@example.com' },
      } as Account;
      const withdrawDto: WithdrawDto = { amount: BigInt(500) };

      mockManager.findOne.mockResolvedValue(account);

      await expect(service.withdraw(1, withdrawDto)).rejects.toThrow(
        'Insufficient balance',
      );
      expect(notificationService.sendEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Withdrawal Failed',
        'Your withdrawal of 500 failed due to insufficient balance.',
      );
    });
  });

  describe('transfer', () => {
    it('should transfer money between accounts and send notifications', async () => {
      const senderAccount = {
        id: 1,
        balance: BigInt(1000),
        user: { email: 'sender@example.com' },
      } as Account;
      const recipientAccount = {
        id: 2,
        balance: BigInt(500),
        user: { email: 'recipient@example.com', username: 'Recipient' },
      } as Account;
      const transferDto: TransferDto = {
        amount: BigInt(300),
        recipientEmail: 'recipient@example.com',
      };

      mockManager.findOne
        .mockResolvedValueOnce(senderAccount)
        .mockResolvedValueOnce(recipientAccount)
        .mockResolvedValueOnce(senderAccount)
        .mockResolvedValueOnce(recipientAccount);
      mockManager.save.mockResolvedValue(senderAccount);

      const result = await service.transfer(1, transferDto);

      expect(senderAccount.balance).toBe(BigInt(700));
      expect(recipientAccount.balance).toBe(BigInt(800));
      expect(result).toBeDefined();
      expect(notificationService.sendEmail).toHaveBeenCalledWith(
        'sender@example.com',
        'Transfer Successful',
        'You have successfully transferred 300 to recipient@example.com. Your new balance is 700.',
      );
    });

    it('should throw an error if sender balance is insufficient', async () => {
      const senderAccount = {
        id: 1,
        balance: BigInt(200),
        user: { email: 'sender@example.com' },
      } as Account;

      const recipientAccount = {
        id: 2,
        balance: BigInt(500),
        user: { email: 'recipient@example.com', username: 'Recipient' },
      } as Account;

      const transferDto: TransferDto = {
        amount: BigInt(300),
        recipientEmail: 'recipient@example.com',
      };

      // Ensure that findOne is called multiple times and returns the correct accounts
      mockManager.findOne
        .mockResolvedValueOnce(senderAccount)
        .mockResolvedValueOnce(recipientAccount)
        .mockResolvedValueOnce(senderAccount)
        .mockResolvedValueOnce(recipientAccount);

      await expect(service.transfer(1, transferDto)).rejects.toThrow(
        'Insufficient balance',
      );

      expect(notificationService.sendEmail).toHaveBeenCalledWith(
        'sender@example.com',
        'Transfer Failed',
        'Your transfer of 300 to recipient@example.com failed due to insufficient balance.',
      );
    });

    it('should throw an error if sender or recipient account is not found', async () => {
      const transferDto: TransferDto = {
        amount: BigInt(300),
        recipientEmail: 'recipient@example.com',
      };

      mockManager.findOne.mockResolvedValue(null);

      await expect(service.transfer(1, transferDto)).rejects.toThrow(
        'Account not found',
      );
    });
  });

  describe('getFilteredTransactions', () => {
    it('should throw an error if account is not found', async () => {
      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getFilteredTransactions(1)).rejects.toThrow(
        'Account not found',
      );
    });
  });

  describe('generateAccountStatement', () => {
    it('should generate account statement and return PDF', async () => {
      const account = {
        id: 1,
        user: { username: 'testuser' },
        balance: BigInt(5000),
        accountType: AccountType.PERSONAL,
      } as Account;
      const transactions = [
        {
          id: 1,
          amount: BigInt(100),
          transactionType: 'Deposit',
          reference: 'abc123',
          createdAt: new Date(),
        },
      ] as Transaction[];
      const mockPdfBuffer = Buffer.from('pdf-content');

      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(account);
      jest.spyOn(transactionRepository, 'find').mockResolvedValue(transactions);
      jest
        .spyOn(pdfService, 'generateAccountStatement')
        .mockResolvedValue(mockPdfBuffer);

      await service.generateAccountStatement(1, res);

      expect(accountRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });
      expect(transactionRepository.find).toHaveBeenCalledWith({
        where: { account: { id: 1 } },
        order: { createdAt: 'DESC' },
      });
      expect(pdfService.generateAccountStatement).toHaveBeenCalledWith(
        account,
        transactions,
      );
      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=account_statement_1.pdf',
        'Content-Length': mockPdfBuffer.length,
      });
      expect(res.send).toHaveBeenCalledWith(mockPdfBuffer);
    });

    it('should throw an error if account is not found', async () => {
      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(null);

      await expect(service.generateAccountStatement(1, res)).rejects.toThrow(
        'Account not found',
      );
    });

    it('should throw an error if PDF generation fails', async () => {
      const account = {
        id: 1,
        user: { username: 'testuser' },
        balance: BigInt(5000),
        accountType: AccountType.PERSONAL,
      } as Account;
      const transactions = [
        {
          id: 1,
          amount: BigInt(100),
          transactionType: TransactionType.DEPOSIT,
          reference: 'abc123',
          createdAt: new Date(),
        },
      ] as Transaction[];

      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(account);
      jest.spyOn(transactionRepository, 'find').mockResolvedValue(transactions);
      jest
        .spyOn(pdfService, 'generateAccountStatement')
        .mockResolvedValue(Buffer.alloc(0));

      await expect(service.generateAccountStatement(1, res)).rejects.toThrow(
        'Failed to generate PDF',
      );
    });
  });
});
