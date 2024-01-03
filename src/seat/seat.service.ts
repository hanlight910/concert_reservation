import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SeatDto } from './dto';
import { NotFoundError } from 'rxjs';

@Injectable()
export class SeatService {
  constructor(private prisma: PrismaService) {}

  async getAllSeatByScheduleId(schedule_id: number) {
    const seats = this.prisma.performance_Seat.findMany({
      where: {
        schedule_id: schedule_id,
      },
      orderBy: { seat_number: 'desc' },
    });

    return seats;
  }

  async registerSeat(dto: SeatDto, schedule_id: number, user_id: number) {
    const schedule = await this.prisma.performance_Schedule.findFirst({
      where: { schedule_id: schedule_id },
      select: { performance: { select: { user_id: true } } },
    });

    if (schedule === null) throw new NotFoundException('Resource not found');
    if (schedule.performance.user_id !== user_id)
      throw new UnauthorizedException('Unauthorized');
    const seats = await this.prisma.$executeRaw`
        INSERT INTO Performance_Seat (
            schedule_id, grade, seat_number, price, updated_at
            ) VALUES (
                ${schedule_id}, ${dto.grade}, ${dto.seat_number}, ${dto.price}, now()
            )`;
    return 'Seat registered';
  }
}
