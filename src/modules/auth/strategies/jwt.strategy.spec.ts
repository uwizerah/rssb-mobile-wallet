import { JwtStrategy } from './jwt.strategy';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [JwtStrategy],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('should validate and return user data', async () => {
    const payload = { sub: 1, username: 'testUser' };
    const result = await jwtStrategy.validate(payload);

    expect(result).toEqual({ id: payload.sub, username: payload.username });
  });

  it('should throw an error if no payload is provided', async () => {
    await expect(jwtStrategy.validate(null)).rejects.toThrowError();
  });
});
