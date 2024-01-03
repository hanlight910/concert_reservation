import { IsNotEmpty } from 'class-validator';

export class WalletDto {
  @IsNotEmpty()
  point: string;
}
