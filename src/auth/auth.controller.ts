import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthDto } from '../common/dtos';
import { Tokens } from '../common/interfaces';
import { Request, Response } from 'express';
import { AtGuard, RtGuard } from '../common/guards';
import { GetCurrenUser, GetCurrenUserId, Public } from '../common/decorators';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  async signinLocal(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
    @Body() dto: AuthDto,
  ): Promise<Tokens> {
    console.log(request.headers['user-agent']);
    const tokens = await this.authService.signinLocal(dto);
    this.authService.setCookie(response, tokens);
    return tokens;
  }

  @Post('logout')
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  logout(
    @GetCurrenUserId() userId: number,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.authService.clearCookie(response);
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Patch('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @GetCurrenUser('refreshToken') refreshTokens: string,
    @GetCurrenUserId() userId: number,
    @Res({ passthrough: true }) response: Response,
  ): Promise<object> {
    console.log(refreshTokens);
    const tokens = await this.authService.refreshTokens(userId, refreshTokens);
    this.authService.setCookie(response, tokens);
    return { message: 'success' };
  }
}
