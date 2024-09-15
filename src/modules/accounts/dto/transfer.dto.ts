import { IsEmail, IsNotEmpty, Min } from 'class-validator';

export class TransferDto {
  @IsNotEmpty({ message: 'Amount is required' })
  @Min(0.01, { message: 'Transfer amount must be greater than 0' })
  amount: bigint;

  @IsEmail({}, { message: 'Invalid recipient email address' })
  @IsNotEmpty({ message: 'Recipient email address is required' })
  recipientEmail: string;
}
