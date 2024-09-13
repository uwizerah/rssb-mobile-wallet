import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AccountsModule } from 'src/modules/accounts/accounts.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account } from 'src/modules/accounts/account.entity';
import { TransactionsModule } from 'src/modules/transactions/transactions.module';
import { User } from 'src/modules/users/user.entity';
import { Repository } from 'typeorm';

describe('AccountsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AccountsModule, TransactionsModule],
    })
      .overrideProvider(getRepositoryToken(Account))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(User))
      .useClass(Repository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/accounts/balance (GET)', () => {
    return request(app.getHttpServer())
      .get('/accounts/balance')
      .set('Authorization', 'Bearer your_access_token')
      .expect(200)
      .expect((res) => {
        expect(res.body.balance).toBeDefined();
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
