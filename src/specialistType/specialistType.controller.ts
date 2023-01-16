import {
  AdvertisingSourceWithIdDto,
  AdvertisingSourceDto,
} from '../common/dtos/advertisingSource.dto';
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
  GetSpecialistTypeDto,
  PatientBaseDto,
  PatientChangeStatusDto,
  PatientWithIdDto,
  SpecialistTypeDto,
  SpecialistTypeWithIdDto,
} from 'src/common/dtos';
import { SpecialistTypeService } from './specialistType.service';

@Controller('specialistType')
export class SpecialistTypeController {
  constructor(private readonly specialistTypeService: SpecialistTypeService) {}

  @Get('get')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async get(
    @Query() dto: GetSpecialistTypeDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SpecialistTypeWithIdDto[]> {
    const response = await this.specialistTypeService.get(dto);
    res.setHeader('X-Total-Count', response.count);
    return response.data;
  }

  @Post('add')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.CREATED)
  async add(@Req() request: Request | any, @Body() dto: SpecialistTypeDto) {
    return this.specialistTypeService.add(
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
    @Body() dto: SpecialistTypeWithIdDto,
  ) {
    return this.specialistTypeService.update(
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
