import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PerformanceDto } from './dto';
import { AdminGuard, JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';

@Controller('performance')
export class PerformanceController {
  constructor(private performanceService: PerformanceService) {}

  @HttpCode(HttpStatus.OK)
  @Get('getAll')
  async getAllPerformance() {
    return this.performanceService.getAllPerformance();
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  @UseGuards(AdminGuard)
  async registerPerformance(
    @Body() dto: PerformanceDto,
    @GetUser() user: User,
  ) {
    const user_id: number = user.user_id;
    return this.performanceService.registerPerformance(dto, user_id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('search')
  async searchPerformance(@Query('keyword') dto: string) {
    return this.performanceService.getPerformancesByKeyword(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':performance_id')
  async getPerformance(@Param('performance_id') performance_id: number) {
    return this.performanceService.getPerformance(+performance_id);
  }
}
