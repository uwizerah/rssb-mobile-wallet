import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { UserDto } from '../users/dto/user.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByUsername: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return user data (UserDto) if credentials are valid', async () => {
      const user = new User();
      user.id = 1;
      user.username = 'john_doe';
      user.email = 'john@example.com';
      user.password = 'hashedPassword';

      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result: UserDto = await authService.validateUser(
        'john_doe',
        'password123',
      );

      const expectedUserDto = new UserDto();
      expectedUserDto.id = 1;
      expectedUserDto.username = 'john_doe';
      expectedUserDto.email = 'john@example.com';

      expect(result).toEqual(expectedUserDto);
    });

    it('should return null if credentials are invalid', async () => {
      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(null);

      const result: UserDto = await authService.validateUser(
        'invalid_user',
        'wrong_password',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return a JWT token', async () => {
      const userDto = new UserDto();
      userDto.id = 1;
      userDto.username = 'john_doe';
      userDto.email = 'john@example.com';

      const jwtPayload = { username: userDto.username, sub: userDto.id };

      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = await authService.login(userDto);

      expect(jwtService.sign).toHaveBeenCalledWith(jwtPayload);
      expect(result).toEqual({ access_token: 'jwt-token' });
    });
  });
});
