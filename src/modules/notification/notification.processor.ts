import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as sgMail from '@sendgrid/mail';

@Processor('email-queue')
export class NotificationProcessor {
  @Process('send-email')
  async handleSendEmail(job: Job) {
    const { to, subject, text } = job.data;

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      text,
    };

    try {
      await sgMail.send(msg);
      console.log(`Email sent to ${to} (retry)`);
    } catch (error) {
      console.error(`Failed to send email to ${to} (retry)`, error);
      throw error;
    }
  }
}
