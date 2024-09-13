import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('signUp', () => {
    it('should create a new user', async () => {
      const mockUser = {
        username: 'john',
        email: 'john@example.com',
        password: 'password',
      };
      jest.spyOn(usersService, 'createUser').mockResolvedValue(mockUser as any);

      const result = await authController.signUp(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should return a JWT token if credentials are valid', async () => {
      const mockLogin = { username: 'john', password: 'password' };
      const mockToken = { access_token: 'valid-jwt-token' };

      jest
        .spyOn(authService, 'validateUser')
        .mockResolvedValue(mockLogin as any);
      jest.spyOn(authService, 'login').mockResolvedValue(mockToken);

      const result = await authController.login(mockLogin);
      expect(result).toEqual(mockToken);
    });

    it('should throw an error if credentials are invalid', async () => {
      const mockLogin = { username: 'john', password: 'invalid-password' };
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(authController.login(mockLogin)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
