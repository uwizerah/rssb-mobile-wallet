import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class NotificationService {
  constructor(
    private configService: ConfigService,
    @InjectQueue('email-queue') private readonly emailQueue: Queue,
  ) {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  async sendEmail(to: string, subject: string, text: string) {
    const msg = {
      to,
      from: {
        email: this.configService.get<string>('SENDGRID_FROM_EMAIL'),
        name: 'Mobile Wallet API',
      },
      subject,
      text,
    };

    try {
      console.log('send email ', msg);
      await sgMail.send(msg);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}`, error);
      await this.emailQueue.add('send-email', { to, subject, text });
    }
  }

  async queueEmail(to: string, subject: string, text: string) {
    console.log('queue email ', text);
    await this.emailQueue.add(
      'send-email',
      { to, subject, text },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );
  }
}
