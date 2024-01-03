import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SeatDto {
  @IsNotEmpty()
  @IsString()
  seat_number: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  grade: string;
}
