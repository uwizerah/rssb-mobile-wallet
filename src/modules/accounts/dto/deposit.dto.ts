import { IsPositive, IsNotEmpty } from 'class-validator';

export class DepositDto {
  @IsNotEmpty({ message: 'Amount is required' })
  @IsPositive({ message: 'Amount must be positive' })
  amount: bigint;
}
