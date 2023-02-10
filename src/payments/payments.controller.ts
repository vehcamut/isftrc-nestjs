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
  GetAdvanceDto,
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
  PaymentDto,
} from 'src/common/dtos';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  //addPaintment
  @Post('add')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.CREATED)
  async add(@Req() request: Request | any, @Body() dto: PaymentDto) {
    return this.paymentsService.add(
      dto,
      request.user?._id,
      request.user?.roles,
    );
  }

  @Get('getAdvance')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async getService(
    @Req() request: Request | any,
    @Query() dto: GetAdvanceDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<number> {
    const response = await this.paymentsService.getAdvance(
      dto,
      request.user?._id,
      request.user?.roles,
    );
    return response;
  }

  // @Get('getGroupsWithTypes')
  // @Public()
  // //@Roles('registrator')
  // @HttpCode(HttpStatus.OK)
  // async get(
  //   @Query() dto: GetServiceDto,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<ServiceGroupWithTypesDto[]> {
  //   const response = await this.servicesService.get(dto);
  //   return response;
  // }

  // @Get('getGroups')
  // @Public()
  // //@Roles('registrator')
  // @HttpCode(HttpStatus.OK)
  // async getGroups(
  //   @Query() dto: GetServiceDto,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<ServiceGroupWithIdDto[]> {
  //   const response = await this.servicesService.getGroups(dto);
  //   return response;
  // }

  // @Get('getTypes')
  // @Public()
  // //@Roles('registrator')
  // @HttpCode(HttpStatus.OK)
  // async getTypes(
  //   @Query() dto: GetTypesDto,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<ServiceTypeWithIdDto[]> {
  //   const response = await this.servicesService.getTypes(dto);
  //   return response;
  // }

  // @Post('addGroup')
  // @Public()
  // //@Roles('registrator')
  // @HttpCode(HttpStatus.CREATED)
  // async addGroup(@Req() request: Request | any, @Body() dto: ServiceGroupDto) {
  //   return this.servicesService.addGroup(
  //     dto,
  //     request.user?._id,
  //     request.user?.roles,
  //   );
  // }

  // @Put('updateGroup')
  // @Public()
  // //@Roles('registrator')
  // @HttpCode(HttpStatus.OK)
  // async updateGroup(
  //   @Req() request: Request | any,
  //   @Body() dto: ServiceGroupWithIdDto,
  // ) {
  //   return this.servicesService.updateGroup(
  //     dto,
  //     request.user?._id,
  //     request.user?.roles,
  //   );
  // }

  // @Post('addType')
  // @Public()
  // //@Roles('registrator')
  // @HttpCode(HttpStatus.CREATED)
  // async addType(@Req() request: Request | any, @Body() dto: ServiceTypeDto) {
  //   return this.servicesService.addType(
  //     dto,
  //     request.user?._id,
  //     request.user?.roles,
  //   );
  // }

  // @Put('updateType')
  // @Public()
  // //@Roles('registrator')
  // @HttpCode(HttpStatus.OK)
  // async updateType(
  //   @Req() request: Request | any,
  //   @Body() dto: ServiceTypeWithIdDto,
  // ) {
  //   return this.servicesService.updateType(
  //     dto,
  //     request.user?._id,
  //     request.user?.roles,
  //   );
  // }

  // @Get('getService')
  // @Public()
  // //@Roles('registrator')
  // @HttpCode(HttpStatus.OK)
  // async getService(
  //   @Req() request: Request | any,
  //   @Query() dto: GetServiseByIdDto,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<ServiceInfoDto> {
  //   const response = await this.servicesService.getService(
  //     dto,
  //     request.user?._id,
  //     request.user?.roles,
  //   );
  //   return response;
  // }

  // @Get('getAllInfoService')
  // @Public()
  // //@Roles('registrator')
  // @HttpCode(HttpStatus.OK)
  // async getAllInfoService(
  //   @Req() request: Request | any,
  //   @Query() dto: GetServiseByIdDto,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<any> {
  //   const response = await this.servicesService.getAllInfoService(
  //     dto,
  //     request.user?._id,
  //     request.user?.roles,
  //   );
  //   return response;
  // }

  // @Post('setAppointment')
  // @Public()
  // //@Roles('registrator')
  // @HttpCode(HttpStatus.CREATED)
  // async setAppointment(
  //   @Req() request: Request | any,
  //   @Body() dto: AddAppointmentToServiceDto,
  // ) {
  //   return this.servicesService.setAppointment(
  //     dto,
  //     request.user?._id,
  //     request.user?.roles,
  //   );
  // }

  // @Post('closeService')
  // @Public()
  // //@Roles('registrator')
  // @HttpCode(HttpStatus.CREATED)
  // async closeService(
  //   @Req() request: Request | any,
  //   @Body() dto: CloseServiceDto,
  // ) {
  //   return this.servicesService.closeService(
  //     dto,
  //     request.user?._id,
  //     request.user?.roles,
  //   );
  // }
}
