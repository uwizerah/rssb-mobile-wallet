import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OAuth2Strategy } from './oauth.strategy';

describe('OAuth2Strategy', () => {
  let oAuth2Strategy: OAuth2Strategy;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuth2Strategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'OAUTH_CLIENT_ID':
                  return 'test-client-id';
                case 'OAUTH_CLIENT_SECRET':
                  return 'test-client-secret';
                case 'OAUTH_CALLBACK_URL':
                  return 'http://localhost:3000/auth/callback';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    oAuth2Strategy = module.get<OAuth2Strategy>(OAuth2Strategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(oAuth2Strategy).toBeDefined();
  });

  it('should call configService.get for OAuth options', () => {
    expect(configService.get).toHaveBeenCalledWith('OAUTH_CLIENT_ID');
    expect(configService.get).toHaveBeenCalledWith('OAUTH_CLIENT_SECRET');
    expect(configService.get).toHaveBeenCalledWith('OAUTH_CALLBACK_URL');
  });

  it('should validate the user', async () => {
    const accessToken = 'test-access-token';
    const refreshToken = 'test-refresh-token';
    const profile = { id: 'test-profile-id', name: 'Test User' };

    const result = await oAuth2Strategy.validate(
      accessToken,
      refreshToken,
      profile,
    );

    expect(result).toEqual({ accessToken, profile });
  });
});
