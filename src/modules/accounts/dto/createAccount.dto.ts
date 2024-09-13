import { AccountType } from '../account-type.enum';
import { IsEnum } from 'class-validator';

export class CreateAccountDto {
  @IsEnum(AccountType)
  accountType: AccountType;
}
