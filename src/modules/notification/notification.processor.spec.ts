import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bull';
import { NotificationProcessor } from './notification.processor';
import * as sgMail from '@sendgrid/mail';

jest.mock('@sendgrid/mail');

describe('NotificationProcessor', () => {
  let processor: NotificationProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationProcessor],
    }).compile();

    processor = module.get<NotificationProcessor>(NotificationProcessor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleSendEmail', () => {
    it('should send email successfully', async () => {
      const mockJob = {
        data: {
          to: 'test@example.com',
          subject: 'Test Subject',
          text: 'Test message',
        },
      } as Job;

      const sendMock = sgMail.send as jest.Mock;
      sendMock.mockResolvedValueOnce([{}, {}]);

      await processor.handleSendEmail(mockJob);

      expect(sgMail.send).toHaveBeenCalledWith({
        to: 'test@example.com',
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'Test Subject',
        text: 'Test message',
      });
    });

    it('should throw an error if email sending fails', async () => {
      const mockJob = {
        data: {
          to: 'test@example.com',
          subject: 'Test Subject',
          text: 'Test message',
        },
      } as Job;

      const sendMock = sgMail.send as jest.Mock;
      sendMock.mockRejectedValueOnce(new Error('Failed to send email'));

      await expect(processor.handleSendEmail(mockJob)).rejects.toThrow(
        'Failed to send email',
      );
      expect(sgMail.send).toHaveBeenCalled();
    });
  });
});
