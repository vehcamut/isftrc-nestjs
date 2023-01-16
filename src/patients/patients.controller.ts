import { AddPatientToRepresentative } from './../common/dtos/patient.dto';
import { SpecialistDto } from './../common/dtos/specialist.dto';
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
  GetPatientRepresentativesDto,
  GetPatientsByIdDto,
  GetPatientsDto,
  GetRequestDto,
  PatientBaseDto,
  PatientChangeStatusDto,
  PatientWithIdDto,
} from 'src/common/dtos';
import { PatientsService } from './patients.service';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get('get')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async get(
    @Query() dto: GetPatientsDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PatientBaseDto[]> {
    const response = await this.patientsService.get(dto);
    res.setHeader('X-Total-Count', response.count);
    return response.data;
  }

  @Get('getById')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async getById(
    @Query() dto: GetPatientsByIdDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PatientBaseDto> {
    // const date = Date.now();
    // let currentDate = null;
    // do {
    //   currentDate = Date.now();
    // } while (currentDate - date < 4000);
    return await this.patientsService.getById(dto);
    //const response = await this.patientsService.getById(dto);
    //res.setHeader('X-Total-Count', response.count);
    //return response.data;
  }

  @Get('getPatientRepresentatives')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async getPatientRepresentatives(
    @Query() dto: GetPatientRepresentativesDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PatientBaseDto[]> {
    const response = await this.patientsService.getPatientRepresentatives(dto);
    res.setHeader('X-Total-Count', response.count);
    return response.data;
  }

  // @Post('removeRepresentative')
  // @Public()
  // //@Roles('registrator')
  // @HttpCode(HttpStatus.CREATED)
  // async removeRepresentative(
  //   @Req() request: Request | any,
  //   @Body() dto: AddPatientToRepresentative,
  // ) {
  //   return this.patientsService.removeRepresentative(
  //     dto,
  //     request.user?._id,
  //     request.user?.roles,
  //   );
  // }

  @Post('add')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.CREATED)
  async add(@Req() request: Request | any, @Body() dto: PatientBaseDto) {
    return this.patientsService.add(
      dto,
      request.user?._id,
      request.user?.roles,
    );
  }

  @Put('update')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async update(@Req() request: Request | any, @Body() dto: PatientWithIdDto) {
    return this.patientsService.update(
      dto,
      request.user?._id,
      request.user?.roles,
    );
  }

  @Patch('changeStatus')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async changeStatus(
    @Req() request: Request | any,
    @Body() dto: PatientChangeStatusDto,
  ) {
    return this.patientsService.changeStatus(
      dto,
      request.user?._id,
      request.user?.roles,
    );
  }
}
