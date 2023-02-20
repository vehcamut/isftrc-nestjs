import { RtStrategy } from './strategies/rt.strategy';
import { User, UserDocument } from '../common/schemas'; //'./schemas';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthDto } from '../common/dtos';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Tokens } from '../common/interfaces';
import { JwtService } from '@nestjs/jwt';
import { createHmac } from 'crypto';
import { Response } from 'express';
import { hashDataSHA512 } from 'src/common/common';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {
    //this.userModel.watch().on('change', (data) => console.log(data));
  }

  async test(dto: AuthDto) {
    console.log('aboba');
    //throw new Error('Method not implemented.');
  }

  async signupLocal(dto: AuthDto): Promise<Tokens> {
    const login: string = dto.login;

    const candidate = await this.userModel.findOne({ login });
    if (candidate) throw new UnauthorizedException('Polizovat yge est');
    const hashedPassword = await this.hashData(dto.password);
    //Убрать пароль? password
    const user = await this.userModel.create({
      ...dto,
      hash: hashedPassword,
    });
    const newUser = new this.userModel(user);
    newUser.save();

    const tokens = await this.getTokens(
      user.id,
      user.login,
      `${user.surname} ${user.name[0]}.${user.patronymic[0]}.`,
      user.roles,
    );
    await this.updateRtHash(newUser.id, tokens.refresh_token);
    return tokens;
  }

  async signinLocal(dto: AuthDto): Promise<Tokens> {
    const login: string = dto.login;
    const candidate = await this.userModel.findOne({ login });
    if (!candidate) throw new ForbiddenException('Access Denied');
    // console.log(hashDataSHA512('admin'));
    if (!candidate.isActive) throw new ForbiddenException('Access Denied');
    // console.log(candidate);
    const pass = hashDataSHA512(dto.password);
    // console.log(pass);
    // console.log(candidate.hash);
    // const passwordMatches = await bcrypt.compare(dto.password, candidate.hash);
    // if (!passwordMatches) throw new ForbiddenException('Access Denied');
    // const passwordMatches = await bcrypt.compare(dto.password, candidate.hash);
    if (pass !== candidate.hash) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(
      candidate.id,
      candidate.login,
      `${candidate.surname} ${candidate.name[0]}.${candidate.patronymic[0]}.`,
      candidate.roles,
    );
    //await this.updateRtHash(candidate.id, tokens.refresh_token);
    const hash = this.hashDataSHA512(tokens.refresh_token.split('.')[2]);

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
    const hash = this.hashDataSHA512(rt.split('.')[2]);

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
    const newHash = this.hashDataSHA512(tokens.refresh_token.split('.')[2]);
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
    const hash = this.hashDataSHA512(rt.split('.')[2]);

    await this.userModel
      .findByIdAndUpdate(userId, {
        $push: {
          rt: { hash: hash },
        },
      })
      .exec();
  }

  async hashData(data: string) {
    return await bcrypt.hash(data, 12);
  }

  hashDataSHA512(data: string) {
    return createHmac(
      'sha512',
      'sdfoj3n9f8nfpdsifo3ipfobids98fb328fbpdsfbisdf932ifpd-134@3423!',
    )
      .update(data)
      .digest('hex');
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
          // expiresIn: '5s',
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
      httpOnly: true,
      sameSite: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.cookie('accessToken', tokens.access_token, {
      //httpOnly: true,
      sameSite: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    console.log('SET');
  }

  clearCookie(res: Response) {
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
  }
}
