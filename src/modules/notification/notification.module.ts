// src/modules/notification/notification.module.ts
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationProcessor } from './notification.processor';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'email-queue', // Queue name for sending emails
      redis: {
        host: 'localhost',
        port: 6379, // Ensure Redis is running on this port
      },
    }),
  ],
  providers: [NotificationService, NotificationProcessor],
  exports: [NotificationService],
})
export class NotificationModule {}
