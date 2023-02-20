import { AddPatientToRepresentative } from '../common/dtos/patient.dto';
import { UserBaseDto, AddBaseUserDto } from '../common/dtos/user.dto';
import { SpecialistDto } from '../common/dtos/specialist.dto';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import {
  Body,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common/decorators';
import { Response } from 'express';
import { Public, Roles } from 'src/common/decorators';
import {
  GetSpecialistsByIdDto,
  AddSpecialistDto,
  GetSpecificSpecialists,
  SpecialistToSelectDto,
  SpecialistWithIdDto,
  GetSpecialistsDto,
  SpecialistChangeStatusDto,
} from 'src/common/dtos';
import { SpecialistsService } from './specialists.service';
import { IPatient } from 'src/common/interfaces';
import { AtGuard } from 'src/common/guards';

@Controller('specialists')
export class SpecialistsController {
  constructor(private readonly specialistsService: SpecialistsService) {}

  // @UseGuards(AtGuard)
  // @Roles('admin', 'representative', 'specialist')

  @Get('get')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async get(
    @Query() dto: GetSpecialistsDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserBaseDto[]> {
    const response = await this.specialistsService.get(dto);
    res.setHeader('X-Total-Count', response.count);
    return response.data;
  }

  @Get('getSpecific')
  @UseGuards(AtGuard)
  @Roles('admin', 'representative')
  @HttpCode(HttpStatus.OK)
  async getSpecificSpecialists(
    @Query() dto: GetSpecificSpecialists,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SpecialistToSelectDto[]> {
    return this.specialistsService.getSpecificSpecialists(dto);
  }

  @Get('getById')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async getById(
    @Query() dto: GetSpecialistsByIdDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SpecialistDto> {
    // const date = Date.now();
    // let currentDate = null;
    // do {
    //   currentDate = Date.now();
    // } while (currentDate - date < 4000);
    return await this.specialistsService.getById(dto);
    //const response = await this.patientsService.getById(dto);
    //res.setHeader('X-Total-Count', response.count);
    //return response.data;
  }

  @Post('add')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async add(@Req() request: Request | any, @Body() dto: AddSpecialistDto) {
    return this.specialistsService.add(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  @Put('update')
  @UseGuards(AtGuard)
  @Roles('admin', 'specialist')
  @HttpCode(HttpStatus.OK)
  async update(
    @Req() request: Request | any,
    @Body() dto: SpecialistWithIdDto,
  ) {
    return this.specialistsService.update(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  @Patch('changeStatus')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async changeStatus(
    @Req() request: Request | any,
    @Body() dto: SpecialistChangeStatusDto,
  ) {
    return this.specialistsService.changeStatus(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }
}
