import { Request, Response } from 'express';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SpecialistDto, UserDto, representativeDto } from '../common/dtos';
import { UseGuards } from '@nestjs/common/decorators';
import { AtGuard } from '../common/guards';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('getProfile')
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(
    @Res({ passthrough: true }) res: Response,
    @Req() request: Request | any,
  ): Promise<UserDto | SpecialistDto | representativeDto> {
    return this.userService.getProfile(request.user?.sub, request.user?.roles);
  }
}
