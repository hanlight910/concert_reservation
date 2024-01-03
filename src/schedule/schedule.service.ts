import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ScheduleRegisterDto } from './dto';
import { NotFoundError } from 'rxjs';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async registerDate(dto: ScheduleRegisterDto, user_id: number) {
    const performance = await this.prisma.performance.findFirst({
      where: { performance_id: dto.performance_id },
    });
    if (performance === null) throw new NotFoundException('Resource not found');
    if (performance.user_id !== user_id)
      throw new UnauthorizedException('Unauthorized');
    const date = this.prisma.performance_Schedule.create({
      data: {
        date: dto.date,
        performance_id: dto.performance_id,
      },
    });
    return date;
  }

  async getSchedule(performance_id: number) {
    return await this.prisma.performance_Schedule.findMany({
      where: { performance_id: performance_id },
    });
  }
}
