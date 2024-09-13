import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to the Mobile Wallet API!';
  }

  getHealthCheck(): string {
    return 'Service is up and running!';
  }
}
