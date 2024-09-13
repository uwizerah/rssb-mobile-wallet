import { IsEmail, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class TransferDto {
  @IsNumber()
  @Min(0.01, { message: 'Transfer amount must be greater than 0' })
  amount: number;

  @IsEmail({}, { message: 'Invalid recipient email address' })
  @IsNotEmpty({ message: 'Recipient email address is required' })
  recipientEmail: string;
}
