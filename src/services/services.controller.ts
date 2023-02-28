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
  GetServiceDto,
  PatientBaseDto,
  PatientChangeStatusDto,
  PatientWithIdDto,
  ServiceGroupDto,
  ServiceGroupWithTypesDto,
  ServiceGroupWithIdDto,
  ServiceTypeDto,
  ServiceTypeWithIdDto,
  GetServiseByIdDto,
  ServiceDto,
  ServiceInfoDto,
  AddAppointmentToServiceDto,
  GetTypesDto,
  CloseServiceDto,
  OpenServiceDto,
  ChangeNoteDto,
} from '../common/dtos';
import { ServicesService } from './services.service';
import { AtGuard } from '../common/guards';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('getGroupsWithTypes')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async get(
    @Query() dto: GetServiceDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ServiceGroupWithTypesDto[]> {
    const response = await this.servicesService.get(dto);
    return response;
  }

  @Get('getGroups')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async getGroups(
    @Query() dto: GetServiceDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ServiceGroupWithIdDto[]> {
    const response = await this.servicesService.getGroups(dto);
    return response;
  }

  @Get('getTypes')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async getTypes(
    @Query() dto: GetTypesDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ServiceTypeWithIdDto[]> {
    const response = await this.servicesService.getTypes(dto);
    return response;
  }

  @Post('addGroup')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async addGroup(@Req() request: Request | any, @Body() dto: ServiceGroupDto) {
    return this.servicesService.addGroup(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  @Put('updateGroup')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async updateGroup(
    @Req() request: Request | any,
    @Body() dto: ServiceGroupWithIdDto,
  ) {
    return this.servicesService.updateGroup(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  @Post('addType')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async addType(@Req() request: Request | any, @Body() dto: ServiceTypeDto) {
    return this.servicesService.addType(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  @Put('updateType')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async updateType(
    @Req() request: Request | any,
    @Body() dto: ServiceTypeWithIdDto,
  ) {
    return this.servicesService.updateType(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  // @Get('getService')
  // @UseGuards(AtGuard)
  // @Roles('admin', 'specialist', 'representative')
  // @HttpCode(HttpStatus.OK)
  // async getService(
  //   @Req() request: Request | any,
  //   @Query() dto: GetServiseByIdDto,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<ServiceInfoDto> {
  //   const response = await this.servicesService.getService(
  //     dto,
  //     request.user?.sub,
  //     request.user?.roles,
  //   );
  //   return response;
  // }

  @Get('getAllInfoService')
  @UseGuards(AtGuard)
  @Roles('admin', 'specialist', 'representative')
  @HttpCode(HttpStatus.OK)
  async getAllInfoService(
    @Req() request: Request | any,
    @Query() dto: GetServiseByIdDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const currentTime = new Date().getTime();
    // eslint-disable-next-line no-empty
    // while (currentTime + 2500 >= new Date().getTime()) {}
    const response = await this.servicesService.getAllInfoService(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
    return response;
  }

  @Post('setAppointment')
  @UseGuards(AtGuard)
  @Roles('admin', 'representative')
  @HttpCode(HttpStatus.CREATED)
  async setAppointment(
    @Req() request: Request | any,
    @Body() dto: AddAppointmentToServiceDto,
  ) {
    return this.servicesService.setAppointment(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  @Post('closeService')
  @UseGuards(AtGuard)
  @Roles('admin', 'specialist')
  @HttpCode(HttpStatus.CREATED)
  async closeService(
    @Req() request: Request | any,
    @Body() dto: CloseServiceDto,
  ) {
    return this.servicesService.closeService(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  @Post('openService')
  @UseGuards(AtGuard)
  @Roles('admin', 'specialist')
  @HttpCode(HttpStatus.CREATED)
  async openService(
    @Req() request: Request | any,
    @Body() dto: OpenServiceDto,
  ) {
    return this.servicesService.openService(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  @Post('changeNote')
  @UseGuards(AtGuard)
  @Roles('admin', 'specialist')
  @HttpCode(HttpStatus.CREATED)
  async changeNote(@Req() request: Request | any, @Body() dto: ChangeNoteDto) {
    return this.servicesService.changeNote(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }
}
