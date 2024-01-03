import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SeatService } from './seat.service';
import { SeatDto } from './dto';
import { AdminGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';

@Controller('seat')
export class SeatController {
  constructor(private seatService: SeatService) {}
  @HttpCode(HttpStatus.OK)
  @Get('schedule_id/:id')
  async getAllSeatsByScheduleId(@Param('id') schedule_id: number) {
    return this.seatService.getAllSeatByScheduleId(+schedule_id);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  @Post('register/:schedule_id')
  async registerSeat(
    @Body() dto: SeatDto,
    @Param('schedule_id') schedule_id: number,
    @GetUser() user: User,
  ) {
    const user_id: number = user.user_id;
    return this.seatService.registerSeat(dto, +schedule_id, user_id);
  }
}
