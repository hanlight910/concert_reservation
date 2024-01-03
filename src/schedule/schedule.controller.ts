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
import { ScheduleService } from './schedule.service';
import { ScheduleRegisterDto } from './dto';
import { AdminGuard, JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';

@Controller('schedule')
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  @Post('register_date')
  async registerDate(@Body() dto: ScheduleRegisterDto, @GetUser() user: User) {
    const user_id: number = user.user_id;
    return this.scheduleService.registerDate(dto, user_id);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @Get('list/:performance_id')
  async getSchedule(@Param('performance_id') performance_id: number) {
    return this.scheduleService.getSchedule(+performance_id);
  }
}
