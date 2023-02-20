import {
  GetSpecialistsByIdDto,
  AddSpecialistDto,
} from '../common/dtos/specialist.dto';
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
  Delete,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common/decorators';
import { Response } from 'express';
import { Public, Roles } from 'src/common/decorators';
import {
  AddRepresentativeDto,
  GetPatientsByIdDto,
  GetPatientsDto,
  GetRepresentativesByIdDto,
  SpecialistWithIdDto,
  GetRepresentativesDto,
  GetRequestDto,
  PatientBaseDto,
  PatientChangeStatusDto,
  PatientWithIdDto,
  RepresentativeWithIdDto,
  representativeDto,
  GetSpecialistsDto,
  SpecialistChangeStatusDto,
  GetAppointmetnsDto,
  AppointmentDto,
  AppointmentWithIdDto,
  AddAppointmentDto,
  AddedAppoitmentInfoDto,
  AddAppointmentResultDto,
  RemoveAppointmentDto,
  GetFreeAppointmetnsDto,
  GetPatientAppointmetnsDto,
  GetAppointmetnsByIdDto,
} from 'src/common/dtos';
import { AppointmentsService } from './appointments.service';
import { IPatient } from 'src/common/interfaces';
import { AtGuard } from 'src/common/guards';

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
    // console.log(response.data);
    return response.data;
  }

  @Get('getById')
  @UseGuards(AtGuard)
  @Roles('admin', 'representative', 'specialist')
  @HttpCode(HttpStatus.OK)
  async getById(
    @Query() dto: GetAppointmetnsByIdDto,
    @Req() request: Request | any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AppointmentWithIdDto[]> {
    const currentTime = new Date().getTime();
    // eslint-disable-next-line no-empty
    // while (currentTime + 2500 >= new Date().getTime()) {}
    const response = await this.appointmentsService.getById(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
    // res.setHeader('X-Total-Count', response.count);
    // console.log(response.data);
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
    // console.log(response.data);
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
    // console.log(response.data);
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
