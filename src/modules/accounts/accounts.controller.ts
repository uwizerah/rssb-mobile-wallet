import {
  Controller,
  Patch,
  Body,
  Param,
  Get,
  UseGuards,
  Post,
  Req,
} from '@nestjs/common';
// import { Throttle } from '@nestjs/throttler';
// import { AuthGuard } from '@nestjs/passport';
import { AccountsService } from './accounts.service';
import { TransactionsService } from '../transactions/transactions.service';
import { DepositDto, WithdrawDto, TransferDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAccountDto } from './dto/createAccount.dto';

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createAccount(
    @Req() req: any,
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<any> {
    const userId = req.user.id;
    return this.accountsService.createAccount(userId, createAccountDto);
  }

  @Get(':id/balance')
  @UseGuards(JwtAuthGuard)
  async getBalance(@Param('id') accountId: number): Promise<any> {
    return this.accountsService.getBalance(accountId);
  }

  @Patch(':id/deposit')
  @UseGuards(JwtAuthGuard)
  async deposit(
    @Param('id') accountId: number,
    @Body() depositDto: DepositDto,
  ) {
    return this.transactionsService.deposit(accountId, depositDto);
  }

  @Patch(':id/withdraw')
  async withdraw(
    @Param('id') accountId: number,
    @Body() withdrawDto: WithdrawDto,
  ) {
    return this.transactionsService.withdraw(accountId, withdrawDto);
  }

  @Patch(':id/transfer')
  async transfer(
    @Param('id') accountId: number,
    @Body() transferDto: TransferDto,
  ) {
    return this.transactionsService.transfer(accountId, transferDto);
  }
}
