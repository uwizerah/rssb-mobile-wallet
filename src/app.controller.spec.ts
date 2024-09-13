import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getWelcomeMessage', () => {
    it('should return "Welcome to the Mobile Wallet API!"', () => {
      expect(appController.getWelcomeMessage()).toBe(
        'Welcome to the Mobile Wallet API!',
      );
    });
  });

  describe('getHealthCheck', () => {
    it('should return "Service is up and running!"', () => {
      expect(appController.getHealthCheck()).toBe('Service is up and running!');
    });
  });
});
