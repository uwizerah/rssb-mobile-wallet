import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationProcessor } from './notification.processor';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'email-queue',
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  providers: [NotificationService, NotificationProcessor],
  exports: [NotificationService, BullModule],
})
export class NotificationModule {}
