import { Request, Response } from 'express';
//import { UserDto } from './dto/user.dto';
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
import { Public, Roles } from 'src/common/decorators';
//import { GetUsersDto } from './';
import { UsersService } from './users.service';
import { GetUsersDto, UserDto } from 'src/common/dtos';
import { Put } from '@nestjs/common/decorators';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('get')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async getSpecialistTypes(
    @Query() dto: GetUsersDto,
    @Res({ passthrough: true }) res: Response,
    //@Body() dto: SpecialistTypesQueryDto,
  ): Promise<UserDto[]> {
    const response = await this.userService.getUsers(dto);
    res.setHeader('X-Total-Count', response.count);
    //res.set('X-Total-Count', '100');
    console.log(dto);

    return response.data;
  }

  @Put('add')
  //@Public()
  @Roles('registrator', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async addSpecialistType(
    @Req() request: Request | any,
    @Body() dto: UserDto,
  ): Promise<object> {
    return this.userService.addUser(dto, request.user?.roles);
  }

  // @Public()
  // @Post('local/signin')
  // @HttpCode(HttpStatus.OK)
  // async signinLocal(
  //   @Res({ passthrough: true }) response: Response,
  //   @Req() request: Request,
  //   @Body() dto: AuthDto,
  // ): Promise<Tokens> {
  //   console.log(request.headers['user-agent']);
  //   const tokens = await this.authService.signinLocal(dto);
  //   this.authService.setCookie(response, tokens);
  //   return tokens;
  // }

  // @Public()
  // @Get('get')
  // @HttpCode(HttpStatus.OK)
  // async signupLocal(
  //   @Body() dto: AuthDto,
  //   @Res({ passthrough: true }) response: Response,
  // ): Promise<Tokens> {
  //   const tokens = await this.authService.signupLocal(dto);
  //   this.authService.setCookie(response, tokens);
  //   return tokens;
  // }
}
