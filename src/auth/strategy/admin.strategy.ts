import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { $Enums } from '@prisma/client';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; email: string; role: $Enums.Role }) {
    const user = await this.prisma.user.findUnique({
      where: {
        user_id: payload.sub,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    if (payload.role !== 'ADMIN')
      throw new UnauthorizedException('Insufficient privileges');
    delete user.password;
    return user;
  }
}
