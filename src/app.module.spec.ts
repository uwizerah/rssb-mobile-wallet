import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TransactionsModule } from './modules/transactions/transactions.module';

describe('AppModule', () => {
  let appModule: TestingModule;

  beforeAll(async () => {
    appModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: async () => ({
            type: 'sqlite', // Using sqlite for in-memory database
            database: ':memory:',
            dropSchema: true,
            entities: [],
            synchronize: true,
          }),
        }),
        ThrottlerModule.forRoot({
          throttlers: [
            {
              ttl: 60,
              limit: 100,
            },
          ],
        }),
        ConfigModule.forRoot({ isGlobal: true }),
        AccountsModule,
        AuthModule,
        UsersModule,
        TransactionsModule,
      ],
    }).compile();
  });

  it('should compile the module', async () => {
    expect(appModule).toBeDefined();
  });

  it('should import TypeOrmModule', () => {
    const typeOrmModule = appModule.get(TypeOrmModule);
    expect(typeOrmModule).toBeDefined();
  });

  it('should import ThrottlerModule', () => {
    const throttlerModule = appModule.get(ThrottlerModule);
    expect(throttlerModule).toBeDefined();
  });

  it('should import ConfigModule', () => {
    const configModule = appModule.get(ConfigModule);
    expect(configModule).toBeDefined();
  });

  it('should import AccountsModule', () => {
    const accountsModule = appModule.get(AccountsModule);
    expect(accountsModule).toBeDefined();
  });

  it('should import AuthModule', () => {
    const authModule = appModule.get(AuthModule);
    expect(authModule).toBeDefined();
  });

  it('should import UsersModule', () => {
    const usersModule = appModule.get(UsersModule);
    expect(usersModule).toBeDefined();
  });

  it('should import TransactionsModule', () => {
    const transactionsModule = appModule.get(TransactionsModule);
    expect(transactionsModule).toBeDefined();
  });
});
