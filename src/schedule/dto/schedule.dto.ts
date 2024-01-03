import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ScheduleRegisterDto {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsNotEmpty()
  @IsNumber()
  performance_id: number;
}
