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
import {
  Body,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common/decorators';
import { Response } from 'express';
import { Public, Roles } from '../common/decorators';
import {
  GetAdvertisingSourceDto,
  GetPatientsByIdDto,
  GetPatientsDto,
  GetRequestDto,
  PatientBaseDto,
  PatientChangeStatusDto,
  PatientWithIdDto,
} from '../common/dtos';
import { AdvertisingSourceService } from './advertisingSource.service';
import { AtGuard } from '../common/guards';

@Controller('advertisingSource')
export class AdvertisingSourceController {
  constructor(
    private readonly advertisingSourceService: AdvertisingSourceService,
  ) {}

  @Get('get')
  @Public()
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
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async add(@Req() request: Request | any, @Body() dto: AdvertisingSourceDto) {
    return this.advertisingSourceService.add(
      dto,
      request.user?._id,
      request.user?.roles,
    );
  }

  @Put('update')
  @UseGuards(AtGuard)
  @Roles('admin')
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
}
