import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([RtStrategy.extractJWT]),
      ignoreExpiration: false,
      secretOrKey: process.env.jwtRefreshSecret,
      passReqToCallback: true,
    });
  }

  private static extractJWT(req: Request): string | null {
    console.log(req.cookies);
    if (
      req.cookies &&
      'refreshToken' in req.cookies &&
      req.cookies.refreshToken.length > 0
    ) {
      return req.cookies.refreshToken;
    }
    return null;
  }

  validate(req: Request, payload: any) {
    const refreshToken = RtStrategy.extractJWT(req);
    req.res.clearCookie('refreshToken');
    req.res.clearCookie('accessToken');
    return {
      ...payload,
      refreshToken,
    };
  }
}
