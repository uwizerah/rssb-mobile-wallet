import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { Account } from '../accounts/account.entity';
import { DepositDto, WithdrawDto, TransferDto } from '../accounts/dto';
import { TransactionType } from './transaction-type.enum';
import { NotificationService } from '../notification/notification.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly notificationService: NotificationService,
  ) {}

  async deposit(
    accountId: number,
    depositDto: DepositDto,
  ): Promise<Transaction> {
    return await this.transactionRepository.manager.transaction(
      async (manager) => {
        const account = await manager.findOne(Account, {
          where: { id: accountId },
          relations: ['user'],
        });
        if (!account) {
          throw new Error('Account not found');
        }

        await manager
          .createQueryBuilder(Account, 'account')
          .setLock('pessimistic_write')
          .where('account.id = :id', { id: accountId })
          .getOne();

        account.balance += depositDto.amount;
        await manager.save(account);

        const transaction = manager.create(Transaction, {
          account,
          transactionType: TransactionType.DEPOSIT,
          amount: depositDto.amount,
          reference: uuidv4(),
        });

        const savedTransaction = await manager.save(transaction);

        await this.notificationService.sendEmail(
          account.user.email,
          'Deposit Successful',
          `You have successfully deposited ${depositDto.amount}. Your new balance is ${account.balance}.`,
        );

        return savedTransaction;
      },
    );
  }

  async withdraw(
    accountId: number,
    withdrawDto: WithdrawDto,
  ): Promise<Transaction> {
    return await this.transactionRepository.manager.transaction(
      async (manager) => {
        const account = await manager.findOne(Account, {
          where: { id: accountId },
          relations: ['user'],
        });

        if (!account) {
          throw new Error('Account not found');
        }

        await manager
          .createQueryBuilder(Account, 'account')
          .setLock('pessimistic_write')
          .where('account.id = :id', { id: accountId })
          .getOne();

        if (account.balance < withdrawDto.amount) {
          await this.notificationService.sendEmail(
            account.user.email,
            'Withdrawal Failed',
            `Your withdrawal of ${withdrawDto.amount} failed due to insufficient balance.`,
          );
          throw new Error('Insufficient balance');
        }

        account.balance -= withdrawDto.amount;
        console.log('withdraw update balance');
        await manager.save(account);

        const transaction = manager.create(Transaction, {
          account,
          transactionType: TransactionType.WITHDRAWAL,
          amount: withdrawDto.amount,
          reference: uuidv4(),
        });

        const savedTransaction = await manager.save(transaction);
        console.log('xxx after saved');
        await this.notificationService.sendEmail(
          account.user.email,
          'Withdrawal Successful',
          `You have successfully withdrawn ${withdrawDto.amount}. Your new balance is ${account.balance}.`,
        );

        return savedTransaction;
      },
    );
  }

  async transfer(
    senderAccountId: number,
    transferDto: TransferDto,
  ): Promise<Transaction> {
    return await this.transactionRepository.manager.transaction(
      async (manager) => {
        let senderAccount = await manager.findOne(Account, {
          where: { id: senderAccountId },
          relations: ['user'],
        });
        let recipientAccount = await manager.findOne(Account, {
          where: { user: { email: transferDto.recipientEmail } },
          relations: ['user'],
        });

        if (!senderAccount || !recipientAccount) {
          throw new Error('Account not found');
        }

        const senderEmail = senderAccount.user.email;
        const recipientUsername = recipientAccount.user.username;

        // Re-fetch the accounts with the pessimistic write lock
        senderAccount = await manager.findOne(Account, {
          where: { id: senderAccountId },
          lock: { mode: 'pessimistic_write' },
        });
        recipientAccount = await manager.findOne(Account, {
          where: { user: { email: transferDto.recipientEmail } },
          lock: { mode: 'pessimistic_write' },
        });

        if (senderAccount.balance < transferDto.amount) {
          await this.notificationService.queueEmail(
            senderEmail,
            'Transfer Failed',
            `Your transfer of ${transferDto.amount} to ${recipientUsername} failed due to insufficient balance.`,
          );
          throw new Error('Insufficient balance');
        }

        senderAccount.balance -= transferDto.amount;
        recipientAccount.balance += transferDto.amount;

        await manager.save(senderAccount);
        await manager.save(recipientAccount);

        const transaction = manager.create(Transaction, {
          account: senderAccount,
          transactionType: TransactionType.TRANSFER,
          amount: transferDto.amount,
          reference: uuidv4(),
        });

        const savedTransaction = await manager.save(transaction);

        await this.notificationService.sendEmail(
          senderEmail,
          'Transfer Successful',
          `You have successfully transferred ${transferDto.amount} to $. Your new balance is ${senderAccount.balance}.`,
        );

        return savedTransaction;
      },
    );
  }

  async getFilteredTransactions(
    accountId: number,
    limit: number = 10,
    page: number = 1,
    startDate?: Date,
    endDate?: Date,
    transactionType?: string,
    minAmount?: number,
    maxAmount?: number,
    recipientAccountId?: number,
  ): Promise<Transaction[]> {
    return await this.transactionRepository.manager.transaction(
      async (manager) => {
        const account = await manager.findOne(Account, {
          where: { id: accountId },
        });

        if (!account) {
          throw new Error('Account not found');
        }

        const queryBuilder = manager
          .createQueryBuilder(Transaction, 'transaction')
          .where('transaction.accountId = :accountId', { accountId });

        if (startDate) {
          queryBuilder.andWhere('transaction.createdAt >= :startDate', {
            startDate,
          });
        }

        if (endDate) {
          queryBuilder.andWhere('transaction.createdAt <= :endDate', {
            endDate,
          });
        }

        if (transactionType) {
          queryBuilder.andWhere(
            'transaction.transactionType = :transactionType',
            {
              transactionType,
            },
          );
        }

        if (minAmount) {
          queryBuilder.andWhere('transaction.amount >= :minAmount', {
            minAmount,
          });
        }

        if (maxAmount) {
          queryBuilder.andWhere('transaction.amount <= :maxAmount', {
            maxAmount,
          });
        }

        if (recipientAccountId) {
          queryBuilder.andWhere(
            'transaction.recipientAccountId = :recipientAccountId',
            {
              recipientAccountId,
            },
          );
        }

        const skip = (page - 1) * limit;

        const transactions = await queryBuilder
          .orderBy('transaction.createdAt', 'DESC')
          .skip(skip)
          .take(limit)
          .getMany();

        return transactions;
      },
    );
  }
}
