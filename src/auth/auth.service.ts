import { User, UserDocument } from '../common/schemas';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthDto } from '../common/dtos';
import { Model } from 'mongoose';
import { Tokens } from '../common/interfaces';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { hashDataSHA512 } from '../common/common';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async signinLocal(dto: AuthDto): Promise<Tokens> {
    const login: string = dto.login;
    const candidate = await this.userModel.findOne({ login });
    if (!candidate)
      throw new ForbiddenException('Неправильный логин или пароль');
    if (!candidate.isActive)
      throw new ForbiddenException('Неправильный логин или пароль');
    const pass = hashDataSHA512(dto.password);
    if (pass !== candidate.hash)
      throw new ForbiddenException('Неправильный логин или пароль');

    const tokens = await this.getTokens(
      candidate.id,
      candidate.login,
      `${candidate.surname} ${candidate.name[0]}.${candidate.patronymic[0]}.`,
      candidate.roles,
    );

    const hash = hashDataSHA512(tokens.refresh_token.split('.')[2]);

    await this.userModel
      .findByIdAndUpdate(candidate.id, {
        rt: { hash: hash },
      })
      .exec();
    return tokens;
  }

  async logout(userId: number) {
    await this.userModel
      .findByIdAndUpdate(userId, { $unset: { hashedRt: '' } })
      .exec();
  }

  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const hash = hashDataSHA512(rt.split('.')[2]);

    const user = await this.userModel
      .findById(userId)
      .where('rt')
      .elemMatch({ hash: hash });

    if (!user) throw new UnauthorizedException('Access Denied');

    const tokens = await this.getTokens(
      user.id,
      user.login,
      `${user.surname} ${user.name[0]}.${user.patronymic[0]}.`,
      user.roles,
    );
    const newHash = hashDataSHA512(tokens.refresh_token.split('.')[2]);
    await this.userModel
      .findOneAndUpdate(
        { _id: userId, 'rt.hash': hash },
        {
          $set: {
            'rt.$.hash': newHash,
          },
        },
      )
      .exec();
    return tokens;
  }

  async updateRtHash(userId: number, rt: string) {
    const hash = hashDataSHA512(rt.split('.')[2]);

    await this.userModel
      .findByIdAndUpdate(userId, {
        $push: {
          rt: { hash: hash },
        },
      })
      .exec();
  }

  async getTokens(
    userId: number,
    login: string,
    name: string,
    roles: string[],
  ): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          roles,
          name,
          login,
        },
        {
          secret: process.env.jwtAccessSecret,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          login,
        },
        {
          secret: process.env.jwtRefreshSecret,
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  setCookie(res: Response, tokens: Tokens) {
    res.cookie('refreshToken', tokens.refresh_token, {
      sameSite: true,
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.cookie('accessToken', tokens.access_token, {
      sameSite: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  clearCookie(res: Response) {
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
  }
}
