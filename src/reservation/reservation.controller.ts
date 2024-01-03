import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReservationService } from './reservation.service';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('reservation')
export class ReservationController {
  constructor(
    private prisma: PrismaService,
    private reservationService: ReservationService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get('getAll')
  async getReservations(@GetUser() user: User) {
    const user_id: number = user.user_id;
    return this.reservationService.getReservations(user_id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('seat_id/:seat_id')
  async bookReservation(
    @Param('seat_id') seat_id: number,
    @GetUser() user: User,
  ) {
    const user_id: number = user.user_id;
    return this.reservationService.bookReservation(user_id, +seat_id);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':reservation_id')
  async getReservationDetail(
    @GetUser() user: User,
    @Param('reservation_id') reservation_id: number,
  ) {
    const user_id: number = user.user_id;
    return this.reservationService.getReservationDetail(
      user_id,
      +reservation_id,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':reservation_id')
  async cancelReservation(
    @GetUser() user: User,
    @Param('reservation_id') reservation_id: number,
  ) {
    const user_id: number = user.user_id;
    return this.reservationService.cancelReservation(user_id, +reservation_id);
  }
}
