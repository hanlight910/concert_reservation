import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReservationService {
  constructor(private prisma: PrismaService) {}

  async getReservations(user_id: number) {
    const reservations = await this.prisma.reservation.findMany({
      where: {
        user_id: user_id,
      },
    });
    return reservations;
  }

  async getReservationDetail(user_id: number, reservation_id: number) {
    const reservation = await this.prisma.reservation.findFirst({
      where: { reservation_id: reservation_id },
    });
    if (reservation === null)
      throw new NotFoundException('Resource not found.');
    if (reservation.user_id !== user_id)
      throw new UnauthorizedException('Unathorized');
    return this.prisma.reservation_detail.findFirst({
      where: { reservation_id: reservation_id },
    });
  }

  async bookReservation(from: number, seat_id: number) {
    if (
      (await this.prisma.reservation.findFirst({
        where: { seat_id: seat_id },
      })) !== null
    ) {
      throw new BadRequestException('Already Reserved.');
    }

    const seat = await this.prisma.performance_Seat.findFirst({
      where: { seat_id: seat_id },
      select: {
        price: true,
        seat_number: true,
        grade: true,
        performance: {
          select: {
            date: true,
            performance: {
              select: { performance_name: true, venue: true },
            },
          },
        },
      },
    });

    if (seat === null) {
      throw new NotFoundException('Resource not found.');
    }

    return await this.prisma.$transaction(async () => {
      const sender = await this.prisma.wallet.update({
        where: {
          user_id: from,
        },
        data: {
          point: { decrement: seat.price },
        },
      });

      if (sender.point < 0) {
        throw new NotFoundException('Insufficient balance.');
      }

      return this.prisma.reservation.create({
        data: {
          user_id: from,
          seat_id: seat_id,
          detail: {
            create: {
              performance_name: seat.performance.performance.performance_name,
              date: seat.performance.date,
              venue: seat.performance.performance.venue,
              seat_number: seat.seat_number,
              grade: seat.grade,
            },
          },
        },
      });
    });
  }

  async cancelReservation(user_id: number, reservation_id: number) {
    const reservation = await this.prisma.reservation.findFirst({
      where: { reservation_id: reservation_id },
      select: {
        user_id: true,
        seat: {
          select: {
            price: true,
            performance: {
              select: { date: true },
            },
          },
        },
      },
    });

    if (reservation === null)
      throw new NotFoundException('Resource not found.');
    console.log(reservation.seat.performance.date);
    if (reservation.user_id !== user_id)
      throw new UnauthorizedException('Unathorized');
    if (
      new Date(reservation.seat.performance.date).getTime() -
        new Date().getTime() <=
      3 * 60 * 60 * 1000
    )
      throw new NotAcceptableException('Reservated Time already passed');

    await this.prisma.$transaction(async () => {
      await this.prisma.reservation.delete({
        where: { reservation_id: reservation_id },
      });

      await this.prisma.wallet.update({
        where: { user_id: user_id },
        data: {
          point: {
            increment: reservation.seat.price,
          },
        },
      });
    });
    return 'Reservation Canceled';
  }
}
