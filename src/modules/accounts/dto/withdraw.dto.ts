import { IsNumber, IsPositive } from 'class-validator';

export class WithdrawDto {
  @IsNumber()
  @IsPositive()
  readonly amount: number;
}
