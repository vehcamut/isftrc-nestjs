import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthDto } from './dto';
import { Tokens } from './types';
import { AuthGuard } from '@nestjs/passport';
import { Recoverable } from 'repl';
import { Request } from 'express';
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
  signupLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signupLocal(dto);
  }

  @Public()
  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  signipLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signipLocal(dto);
  }

  @Post('logout')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrenUserId() userId: number) {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrenUser('refreshToken') refreshTokens: string,
    @GetCurrenUserId() userId: number,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshTokens);
    //return this.authService.refreshTokens();
  }
}
