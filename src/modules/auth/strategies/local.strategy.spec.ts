import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    authService = {
      validateUser: jest
        .fn()
        .mockResolvedValue({ id: 1, username: 'testUser' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
  });

  it('should validate and return user', async () => {
    const result = await localStrategy.validate('testUser', 'password');
    expect(result).toEqual({ id: 1, username: 'testUser' });
  });
});
