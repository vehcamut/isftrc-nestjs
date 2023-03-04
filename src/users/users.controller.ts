import { Request, Response } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Public, Roles } from '../common/decorators';
//import { GetUsersDto } from './';
import { UsersService } from './users.service';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  AddUserDto,
  GetProfileDto,
  GetUsersDto,
  RepresentativeWithIdDto,
  SpecialistDto,
  UserDto,
  representativeDto,
} from '../common/dtos';
import { Put, UseGuards } from '@nestjs/common/decorators';
import { User } from '../common/schemas';
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
