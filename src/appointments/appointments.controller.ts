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
import { Body, Delete, Patch, Post, Put, Req } from '@nestjs/common/decorators';
import { Response } from 'express';
import { Public } from 'src/common/decorators';
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

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('get')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async get(
    @Query() dto: GetAppointmetnsDto,
    @Req() request: Request | any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AppointmentWithIdDto[]> {
    const response = await this.appointmentsService.get(
      dto,
      request.user?._id,
      request.user?.roles,
    );
    res.setHeader('X-Total-Count', response.count);
    // console.log(response.data);
    return response.data;
  }

  @Get('getById')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async getById(
    @Query() dto: GetAppointmetnsByIdDto,
    @Req() request: Request | any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AppointmentWithIdDto[]> {
    const response = await this.appointmentsService.getById(
      dto,
      request.user?._id,
      request.user?.roles,
    );
    // res.setHeader('X-Total-Count', response.count);
    // console.log(response.data);
    return response;
  }

  @Get('getForPatient')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async getForPatient(
    @Query() dto: GetPatientAppointmetnsDto,
    @Req() request: Request | any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AppointmentWithIdDto[]> {
    const response = await this.appointmentsService.getForPatient(
      dto,
      request.user?._id,
      request.user?.roles,
    );
    res.setHeader('X-Total-Count', response.count);
    // console.log(response.data);
    return response.data;
  }

  @Get('getForRecord')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async getForRecord(
    @Query() dto: GetFreeAppointmetnsDto,
    @Req() request: Request | any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AppointmentWithIdDto[]> {
    const response = await this.appointmentsService.getForRecord(
      dto,
      request.user?._id,
      request.user?.roles,
    );
    res.setHeader('X-Total-Count', response.count);
    // console.log(response.data);
    return response.data;
  }

  @Post('add')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.CREATED)
  async add(
    @Req() request: Request | any,
    @Body() dto: AddAppointmentDto,
  ): Promise<AddAppointmentResultDto> {
    return this.appointmentsService.add(
      dto,
      request.user?._id,
      request.user?.roles,
    );
  }

  @Delete('remove')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Req() request: Request | any,
    @Body() dto: RemoveAppointmentDto,
  ) {
    return this.appointmentsService.remove(
      dto,
      request.user?._id,
      request.user?.roles,
    );
  }

  // async add(@Req() request: Request | any, @Body() dto: AddSpecialistDto) {
  //   return this.specialistsService.add(
  //     dto,
  //     request.user?._id,
  //     request.user?.roles,
  //   );
  // }

  // @Get('getById')
  // @Public()
  // //@Roles('registrator')
  // @HttpCode(HttpStatus.OK)
  // async getById(
  //   @Query() dto: GetSpecialistsByIdDto,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<SpecialistDto> {
  //   // const date = Date.now();
  //   // let currentDate = null;
  //   // do {
  //   //   currentDate = Date.now();
  //   // } while (currentDate - date < 4000);
  //   return await this.specialistsService.getById(dto);
  //   //const response = await this.patientsService.getById(dto);
  //   //res.setHeader('X-Total-Count', response.count);
  //   //return response.data;
  // }

  // @Post('add')
  // @Public()
  // //@Roles('registrator')
  // @HttpCode(HttpStatus.CREATED)
  // async add(@Req() request: Request | any, @Body() dto: AddSpecialistDto) {
  //   return this.specialistsService.add(
  //     dto,
  //     request.user?._id,
  //     request.user?.roles,
  //   );
  // }

  // @Put('update')
  // @Public()
  // //@Roles('registrator')
  // @HttpCode(HttpStatus.OK)
  // async update(
  //   @Req() request: Request | any,
  //   @Body() dto: SpecialistWithIdDto,
  // ) {
  //   return this.specialistsService.update(
  //     dto,
  //     request.user?._id,
  //     request.user?.roles,
  //   );
  // }

  // // @Get('patients')
  // // @Public()
  // // //@Roles('registrator')
  // // @HttpCode(HttpStatus.OK)
  // // async getPatientsById(
  // //   @Query() dto: GetRepresentativesByIdDto,
  // //   @Res({ passthrough: true }) res: Response,
  // // ): Promise<IPatient[]> {
  // //   // const date = Date.now();
  // //   // let currentDate = null;
  // //   // do {
  // //   //   currentDate = Date.now();
  // //   // } while (currentDate - date < 4000);
  // //   return await this.specialistsService.getPatientsById(dto);
  // //   //const response = await this.patientsService.getById(dto);
  // //   //res.setHeader('X-Total-Count', response.count);
  // //   //return response.data;
  // // }

  // // @Post('addPatient')
  // // @Public()
  // // //@Roles('registrator')
  // // @HttpCode(HttpStatus.CREATED)
  // // async addPatient(
  // //   @Req() request: Request | any,
  // //   @Body() dto: AddPatientToRepresentative,
  // // ) {
  // //   return this.specialistsService.addPatient(
  // //     dto,
  // //     request.user?._id,
  // //     request.user?.roles,
  // //   );
  // // }

  // // @Post('removePatient')
  // // @Public()
  // // //@Roles('registrator')
  // // @HttpCode(HttpStatus.CREATED)
  // // async removePatient(
  // //   @Req() request: Request | any,
  // //   @Body() dto: AddPatientToRepresentative,
  // // ) {
  // //   return this.specialistsService.removePatient(
  // //     dto,
  // //     request.user?._id,
  // //     request.user?.roles,
  // //   );
  // // }

  // @Patch('changeStatus')
  // @Public()
  // @HttpCode(HttpStatus.OK)
  // async changeStatus(
  //   @Req() request: Request | any,
  //   @Body() dto: SpecialistChangeStatusDto,
  // ) {
  //   return this.specialistsService.changeStatus(
  //     dto,
  //     request.user?._id,
  //     request.user?.roles,
  //   );
  // }
}
