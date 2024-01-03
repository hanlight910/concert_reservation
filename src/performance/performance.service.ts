import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PerformanceDto } from './dto';

@Injectable()
export class PerformanceService {
  constructor(private prisma: PrismaService) {}

  async getAllPerformance() {
    const performances = this.prisma.performance.findMany({});
    return performances;
  }

  async registerPerformance(dto: PerformanceDto, user_id) {
    return this.prisma.performance.create({
      data: {
        performance_name: dto.performance_name,
        price: dto.price,
        venue: dto.venue,
        content: dto.content,
        user_id: user_id,
      },
    });
  }

  async getPerformancesByKeyword(dto: string) {
    const performances = this.prisma.performance.findMany({
      where: {
        performance_name: {
          contains: `${dto}`,
        },
      },
    });
    return performances;
  }

  async getPerformance(performance_id: number) {
    const performance = this.prisma.performance.findFirst({
      where: { performance_id: performance_id },
    });
    return performance;
  }
}
