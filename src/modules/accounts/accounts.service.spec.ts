import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from './accounts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { User } from '../users/user.entity';
import { CreateAccountDto } from './dto/createAccount.dto';
import { AccountType } from './account-type.enum';

describe('AccountsService', () => {
  let service: AccountsService;
  let accountRepository: Repository<Account>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(Account),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    accountRepository = module.get<Repository<Account>>(
      getRepositoryToken(Account),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test createAccount
  describe('createAccount', () => {
    it('should create a new account', async () => {
      const userId = 1;
      const createAccountDto: CreateAccountDto = {
        accountType: AccountType.PERSONAL,
      };

      const user = new User();
      user.id = userId;

      const newAccount = new Account();
      newAccount.accountType = createAccountDto.accountType;
      newAccount.balance = 0;
      newAccount.user = user;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(accountRepository, 'create').mockReturnValue(newAccount);
      jest.spyOn(accountRepository, 'save').mockResolvedValue(new Account());

      const result = await service.createAccount(userId, createAccountDto);
      expect(result).toBeInstanceOf(Account);
    });

    it('should throw an error if user is not found', async () => {
      const userId = 1;
      const createAccountDto: CreateAccountDto = {
        accountType: AccountType.BUSINESS,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.createAccount(userId, createAccountDto),
      ).rejects.toThrow('User not found');
    });
  });

  // Test getAccount
  describe('getAccount', () => {
    it('should return account details by accountId', async () => {
      const accountId = 1;
      const account = new Account();
      account.id = accountId;

      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(account);

      const result = await service.getAccount(accountId);
      expect(result.id).toEqual(accountId);
    });
  });

  // Test getBalance
  describe('getBalance', () => {
    it('should return the balance of the account', async () => {
      const userId = 1;
      const account = new Account();
      account.balance = 500;

      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(account);

      const result = await service.getBalance(userId);
      expect(result.balance).toEqual(500);
    });

    it('should throw an error if account is not found', async () => {
      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getBalance(1)).rejects.toThrow('Account not found');
    });
  });
});
