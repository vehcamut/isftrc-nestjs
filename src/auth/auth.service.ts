import { User, UserDocument } from './../user.schema';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthDto } from './dto';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { createHmac } from 'crypto';
import { Response } from 'express';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async signupLocal(dto: AuthDto): Promise<Tokens> {
    const email: string = dto.email;

    const candidate = await this.userModel.findOne({ email });
    if (candidate) {
      console.log('USER EST');
    } else {
      const hashedPassword = await this.hashData(dto.password);
      //Убрать пароль? password
      const user = await this.userModel.create({
        ...dto,
        hash: hashedPassword,
      });
      const newUser = new this.userModel(user);
      newUser.save();

      const tokens = await this.getTokens(
        newUser.id,
        newUser.email,
        newUser.roles,
      );
      await this.updateRtHash(newUser.id, tokens.refresh_token);
      return tokens;
    }
  }

  async signipLocal(dto: AuthDto): Promise<Tokens> {
    const email: string = dto.email;
    const candidate = await this.userModel.findOne({ email });

    if (!candidate) throw new ForbiddenException('Access Denied');

    const passwordMatches = await bcrypt.compare(dto.password, candidate.hash);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(
      candidate.id,
      candidate.email,
      candidate.roles,
    );
    await this.updateRtHash(candidate.id, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: number) {
    await this.userModel
      .findByIdAndUpdate(userId, { $unset: { hashedRt: '' } })
      .exec();
  }

  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const hash = createHmac('sha512', 'secret').update(rt).digest('hex');
    const rtMatches = hash === user.hashedRt;

    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email, user.roles);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async updateRtHash(userId: number, rt: string) {
    const hash = createHmac('sha512', 'secret').update(rt).digest('hex');
    await this.userModel.findByIdAndUpdate(userId, { hashedRt: hash }).exec();
    console.log(userId);
  }

  hashData(data: string) {
    return bcrypt.hash(data, 12);
  }

  async getTokens(
    userId: number,
    email: string,
    roles: string[],
  ): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          roles,
          email,
        },
        {
          secret: process.env.jwtAccessSecret,
          expiresIn: '5m',
          //???expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
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
      httpOnly: true,
      sameSite: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.cookie('accessToken', tokens.access_token, {
      httpOnly: true,
      sameSite: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  clearCookie(res: Response) {
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
  }
}
