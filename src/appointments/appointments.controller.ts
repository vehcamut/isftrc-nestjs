import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import { Body, Delete, Post, Req, UseGuards } from '@nestjs/common/decorators';
import { Response } from 'express';
import { Roles } from '../common/decorators';
import {
  GetAppointmetnsDto,
  AppointmentWithIdDto,
  AddAppointmentDto,
  AddAppointmentResultDto,
  RemoveAppointmentDto,
  GetFreeAppointmetnsDto,
  GetPatientAppointmetnsDto,
  GetAppointmetnsByIdDto,
} from '../common/dtos';
import { AppointmentsService } from './appointments.service';
import { AtGuard } from '../common/guards';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('get')
  @UseGuards(AtGuard)
  @Roles('admin', 'specialist')
  @HttpCode(HttpStatus.OK)
  async get(
    @Query() dto: GetAppointmetnsDto,
    @Req() request: Request | any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AppointmentWithIdDto[]> {
    const response = await this.appointmentsService.get(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
    res.setHeader('X-Total-Count', response.count);
    return response.data;
  }

  @Get('getById')
  @UseGuards(AtGuard)
  @Roles('admin', 'representative', 'specialist')
  @HttpCode(HttpStatus.OK)
  async getById(
    @Query() dto: GetAppointmetnsByIdDto,
    @Req() request: Request | any,
  ): Promise<AppointmentWithIdDto[]> {
    const response = await this.appointmentsService.getById(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
    return response;
  }

  @Get('getForPatient')
  @UseGuards(AtGuard)
  @Roles('admin', 'representative', 'specialist')
  @HttpCode(HttpStatus.OK)
  async getForPatient(
    @Query() dto: GetPatientAppointmetnsDto,
    @Req() request: Request | any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AppointmentWithIdDto[]> {
    const response = await this.appointmentsService.getForPatient(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
    res.setHeader('X-Total-Count', response.count);
    return response.data;
  }

  @Get('getForRecord')
  @UseGuards(AtGuard)
  @Roles('admin', 'representative')
  @HttpCode(HttpStatus.OK)
  async getForRecord(
    @Query() dto: GetFreeAppointmetnsDto,
    @Req() request: Request | any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AppointmentWithIdDto[]> {
    const response = await this.appointmentsService.getForRecord(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
    res.setHeader('X-Total-Count', response.count);
    return response.data;
  }

  @Post('add')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async add(
    @Req() request: Request | any,
    @Body() dto: AddAppointmentDto,
  ): Promise<AddAppointmentResultDto> {
    return this.appointmentsService.add(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  @Delete('remove')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Req() request: Request | any,
    @Body() dto: RemoveAppointmentDto,
  ) {
    return this.appointmentsService.remove(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }
}
