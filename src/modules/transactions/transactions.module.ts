import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { TransactionsService } from './transactions.service';
import { Account } from '../accounts/account.entity';
import { TransactionsController } from './transactions.controller';
import { NotificationModule } from '../notification/notification.module';
import { PdfService } from '../../utils/pdf.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Account]),
    NotificationModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, PdfService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
