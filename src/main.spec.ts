import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

describe('Main (bootstrap)', () => {
  let app: any;

  beforeEach(() => {
    app = {
      useGlobalPipes: jest.fn(),
      get: jest.fn((service) => {
        if (service === ConfigService) {
          return {
            get: jest.fn().mockReturnValue(3000),
          };
        }
        return {};
      }),
      listen: jest.fn().mockResolvedValue(''),
      getUrl: jest.fn().mockResolvedValue('http://localhost:3000'),
    };

    (NestFactory.create as jest.Mock).mockResolvedValue(app);
  });

  it('should initialize the app and start listening', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const { bootstrap } = await import('./main');
    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(app.useGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe));
    expect(app.listen).toHaveBeenCalledWith(3000);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Application is running on: http://localhost:3000',
    );

    consoleSpy.mockRestore();
  });
});
