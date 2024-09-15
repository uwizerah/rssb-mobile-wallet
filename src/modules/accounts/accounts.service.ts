import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { CreateAccountDto } from './dto/createAccount.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createAccount(
    userId: number,
    createAccountDto: CreateAccountDto,
  ): Promise<Account> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const newAccount = this.accountRepository.create({
      user,
      balance: BigInt(0),
      accountType: createAccountDto.accountType,
    });

    return await this.accountRepository.save(newAccount);
  }

  async getAccount(accountId: number): Promise<Account> {
    return await this.accountRepository.findOne({ where: { id: accountId } });
  }

  async getBalance(userId: number): Promise<any> {
    const account = await this.accountRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!account) {
      throw new Error('Account not found');
    }
    return { balance: account.balance };
  }
}
