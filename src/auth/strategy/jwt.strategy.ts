import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
    wallet: { point: number };
  }) {
    const user = await this.prisma.user.findUnique({
      where: {
        user_id: payload.sub,
      },
      include: {
        wallet: {
          select: { point: true },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    delete user.password;
    return user;
  }
}
