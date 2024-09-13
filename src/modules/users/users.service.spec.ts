import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test createUser function
  describe('createUser', () => {
    it('should create a new user with a hashed password', async () => {
      const username = 'testuser';
      const email = 'test@example.com';
      const password = 'password123';

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashedPassword'));
      jest.spyOn(userRepository, 'create').mockReturnValue(new User());
      jest.spyOn(userRepository, 'save').mockResolvedValue(new User());

      const result = await service.createUser(username, email, password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBeInstanceOf(User);
    });
  });

  // Test findByUsername function
  describe('findByUsername', () => {
    it('should return a user if found by username', async () => {
      const username = 'testuser';
      const user = new User();
      user.username = username;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.findByUsername(username);

      expect(result).toBeInstanceOf(User);
      expect(result.username).toEqual(username);
    });

    it('should return undefined if user is not found', async () => {
      const username = 'testuser';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      const result = await service.findByUsername(username);

      expect(result).toBeUndefined();
    });
  });
});
