import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bull';
import * as sgMail from '@sendgrid/mail';
import { Queue } from 'bull';

jest.mock('@sendgrid/mail');

describe('NotificationService', () => {
  let service: NotificationService;
  let emailQueue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'SENDGRID_API_KEY') {
                return 'test-api-key';
              }
              if (key === 'SENDGRID_FROM_EMAIL') {
                return 'no-reply@example.com';
              }
              return null;
            }),
          },
        },
        {
          provide: getQueueToken('email-queue'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    emailQueue = module.get<Queue>(getQueueToken('email-queue'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      const sendMock = sgMail.send as jest.Mock;
      sendMock.mockResolvedValueOnce([{}, {}]);

      await service.sendEmail(
        'test@example.com',
        'Test Subject',
        'Test message',
      );

      expect(sgMail.send).toHaveBeenCalledWith({
        to: 'test@example.com',
        from: { email: 'no-reply@example.com', name: 'Mobile Wallet API' },
        subject: 'Test Subject',
        text: 'Test message',
      });
      expect(emailQueue.add).not.toHaveBeenCalled();
    });

    it('should queue email if sending fails', async () => {
      const sendMock = sgMail.send as jest.Mock;
      sendMock.mockRejectedValueOnce(new Error('Failed to send email'));

      await service.sendEmail(
        'test@example.com',
        'Test Subject',
        'Test message',
      );

      expect(emailQueue.add).toHaveBeenCalledWith('send-email', {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test message',
      });
    });
  });

  describe('queueEmail', () => {
    it('should add email to the queue with retry logic', async () => {
      await service.queueEmail(
        'test@example.com',
        'Test Subject',
        'Test message',
      );

      expect(emailQueue.add).toHaveBeenCalledWith(
        'send-email',
        {
          to: 'test@example.com',
          subject: 'Test Subject',
          text: 'Test message',
        },
        {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      );
    });
  });
});
