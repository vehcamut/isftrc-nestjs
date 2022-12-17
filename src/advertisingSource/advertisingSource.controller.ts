import {
  AdvertisingSourceWithIdDto,
  AdvertisingSourceDto,
} from './../common/dtos/advertisingSource.dto';
import { SpecialistDto } from '../common/dtos/specialist.dto';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import { Body, Patch, Post, Put, Req } from '@nestjs/common/decorators';
import { Response } from 'express';
import { Public } from 'src/common/decorators';
import {
  GetAdvertisingSourceDto,
  GetPatientsByIdDto,
  GetPatientsDto,
  GetRequestDto,
  PatientBaseDto,
  PatientChangeStatusDto,
  PatientWithIdDto,
} from 'src/common/dtos';
import { AdvertisingSourceService } from './advertisingSource.service';

@Controller('advertisingSource')
export class AdvertisingSourceController {
  constructor(
    private readonly advertisingSourceService: AdvertisingSourceService,
  ) {}

  @Get('get')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async get(
    @Query() dto: GetAdvertisingSourceDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AdvertisingSourceWithIdDto[]> {
    const response = await this.advertisingSourceService.get(dto);
    res.setHeader('X-Total-Count', response.count);
    return response.data;
  }

  @Post('add')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.CREATED)
  async add(@Req() request: Request | any, @Body() dto: AdvertisingSourceDto) {
    return this.advertisingSourceService.add(
      dto,
      request.user?._id,
      request.user?.roles,
    );
  }

  @Put('update')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async update(
    @Req() request: Request | any,
    @Body() dto: AdvertisingSourceWithIdDto,
  ) {
    return this.advertisingSourceService.update(
      dto,
      request.user?._id,
      request.user?.roles,
    );
  }

  // @Patch('changeStatus')
  // @Public()
  // //@Roles('registrator')
  // @HttpCode(HttpStatus.OK)
  // async changeStatus(
  //   @Req() request: Request | any,
  //   @Body() dto: PatientChangeStatusDto,
  // ) {
  //   return this.advertisingSourceService.changeStatus(
  //     dto,
  //     request.user?._id,
  //     request.user?.roles,
  //   );
  // }
}
