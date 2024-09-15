import { IsPositive, IsNotEmpty } from 'class-validator';

export class WithdrawDto {
  @IsNotEmpty({ message: 'Amount is required' })
  @IsPositive({ message: 'Amount must be positive' })
  readonly amount: bigint;
}
