import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthDto } from './dto';
import { Tokens } from './types';
import { AuthGuard } from '@nestjs/passport';
import { Recoverable } from 'repl';
import { Request, Response } from 'express';
import { AtGuard, RtGuard } from '../common/guards';
import {
  GetCurrenUser,
  GetCurrenUserId,
  Public,
  Roles,
} from '../common/decorators';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  async signupLocal(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Tokens> {
    const tokens = await this.authService.signupLocal(dto);
    this.authService.setCookie(response, tokens);
    return tokens;
  }

  @Public()
  @Post('test')
  @HttpCode(HttpStatus.OK)
  async signindLocal(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
    @Body() dto: AuthDto,
  ) {
    console.log(request.headers['user-agent']);
    const tokens = await this.authService.test(dto);
    //this.authService.setCookie(response, tokens);
  }

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
  @Roles('admin')
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
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @GetCurrenUser('refreshToken') refreshTokens: string,
    @GetCurrenUserId() userId: number,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Tokens> {
    console.log(refreshTokens);
    const tokens = await this.authService.refreshTokens(userId, refreshTokens);
    this.authService.setCookie(response, tokens);
    return tokens;
    //return this.authService.refreshTokens();
  }
}
