import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsService } from './accounts.service';
import { Account } from './account.entity';
import { User } from '../users/user.entity';
import { AccountsController } from './accounts.controller';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionsModule } from '../transactions/transactions.module';
import { Transaction } from '../transactions/transaction.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationModule } from '../notification/notification.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, User, Transaction]),
    TransactionsModule,
    NotificationModule,
    BullModule.registerQueue({
      name: 'email-queue',
    }),
    ConfigModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService, TransactionsService, NotificationService],
  exports: [AccountsService],
})
export class AccountsModule {}
