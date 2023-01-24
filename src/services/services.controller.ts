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
  GetServiceDto,
  PatientBaseDto,
  PatientChangeStatusDto,
  PatientWithIdDto,
  ServiceGroupDto,
  ServiceGroupWithTypesDto,
  ServiceGroupWithIdDto,
  ServiceTypeDto,
  ServiceTypeWithIdDto,
} from 'src/common/dtos';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('getGroupsWithTypes')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async get(
    @Query() dto: GetServiceDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ServiceGroupWithTypesDto[]> {
    const response = await this.servicesService.get(dto);
    return response;
  }

  @Get('getGroups')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async getGroups(
    @Query() dto: GetServiceDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ServiceGroupWithIdDto[]> {
    const response = await this.servicesService.getGroups(dto);
    return response;
  }

  @Post('addGroup')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.CREATED)
  async addGroup(@Req() request: Request | any, @Body() dto: ServiceGroupDto) {
    return this.servicesService.addGroup(
      dto,
      request.user?._id,
      request.user?.roles,
    );
  }

  @Put('updateGroup')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async updateGroup(
    @Req() request: Request | any,
    @Body() dto: ServiceGroupWithIdDto,
  ) {
    return this.servicesService.updateGroup(
      dto,
      request.user?._id,
      request.user?.roles,
    );
  }

  @Post('addType')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.CREATED)
  async addType(@Req() request: Request | any, @Body() dto: ServiceTypeDto) {
    return this.servicesService.addType(
      dto,
      request.user?._id,
      request.user?.roles,
    );
  }

  @Put('updateType')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async updateType(
    @Req() request: Request | any,
    @Body() dto: ServiceTypeWithIdDto,
  ) {
    return this.servicesService.updateType(
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
