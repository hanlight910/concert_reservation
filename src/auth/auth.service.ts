import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto, SignupDto } from './dto';
import { hash, verify } from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { $Enums } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async signup(dto: SignupDto) {
    try {
      const hashedPassword = await hash(dto.password);
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          role: dto.role,
          wallet: {
            create: {
              point: 1000000,
            },
          },
        },
        include: {
          wallet: {
            select: {
              point: true,
            },
          },
        },
      });
      delete user.password;
      return { user };
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ForbiddenException('Credential Taken');
      }
      throw error;
    }
  }

  async signin(dto: SignInDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
        select: {
          user_id: true,
          email: true,
          password: true,
          role: true,
          wallet: {
            select: {
              point: true,
            },
          },
        },
      });

      if (!user) throw new ForbiddenException('Credentials incorrect');

      const passwordMatched = await verify(user.password, dto.password);

      if (!passwordMatched)
        throw new ForbiddenException('Credentials incorrect');

      return this.signToken(user.user_id, user.email, user.wallet, user.role);
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ForbiddenException('Credential Taken');
      }
      throw error;
    }
  }
  async signToken(
    user_id: number,
    email: string,
    wallet: { point: number },
    role: $Enums.Role,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: user_id,
      email,
      wallet,
      role,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: this.config.get('JWT_SECRET'),
    });

    return { access_token: token };
  }
}
