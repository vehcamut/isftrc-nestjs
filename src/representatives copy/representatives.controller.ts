import { AddPatientToRepresentative } from './../common/dtos/patient.dto';
import { UserBaseDto, AddBaseUserDto } from './../common/dtos/user.dto';
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
  AddRepresentativeDto,
  GetPatientsByIdDto,
  GetPatientsDto,
  GetRepresentativesByIdDto,
  GetRepresentativesDto,
  GetRequestDto,
  PatientBaseDto,
  PatientChangeStatusDto,
  PatientWithIdDto,
  RepresentativeWithIdDto,
  representativeDto,
} from 'src/common/dtos';
import { RepresentativesService } from './representatives.service';
import { IPatient } from 'src/common/interfaces';

@Controller('representatives')
export class RepresentativesController {
  constructor(
    private readonly representativesService: RepresentativesService,
  ) {}

  @Get('get')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async get(
    @Query() dto: GetRepresentativesDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserBaseDto[]> {
    const response = await this.representativesService.get(dto);
    res.setHeader('X-Total-Count', response.count);
    return response.data;
  }

  @Get('getById')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async getById(
    @Query() dto: GetRepresentativesByIdDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<representativeDto> {
    // const date = Date.now();
    // let currentDate = null;
    // do {
    //   currentDate = Date.now();
    // } while (currentDate - date < 4000);
    return await this.representativesService.getById(dto);
    //const response = await this.patientsService.getById(dto);
    //res.setHeader('X-Total-Count', response.count);
    //return response.data;
  }

  @Post('add')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.CREATED)
  async add(@Req() request: Request | any, @Body() dto: AddRepresentativeDto) {
    return this.representativesService.add(
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
    @Body() dto: RepresentativeWithIdDto,
  ) {
    return this.representativesService.update(
      dto,
      request.user?._id,
      request.user?.roles,
    );
  }

  @Get('patients')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async getPatientsById(
    @Query() dto: GetRepresentativesByIdDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IPatient[]> {
    // const date = Date.now();
    // let currentDate = null;
    // do {
    //   currentDate = Date.now();
    // } while (currentDate - date < 4000);
    return await this.representativesService.getPatientsById(dto);
    //const response = await this.patientsService.getById(dto);
    //res.setHeader('X-Total-Count', response.count);
    //return response.data;
  }

  @Post('addPatient')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.CREATED)
  async addPatient(
    @Req() request: Request | any,
    @Body() dto: AddPatientToRepresentative,
  ) {
    return this.representativesService.addPatient(
      dto,
      request.user?._id,
      request.user?.roles,
    );
  }

  @Post('removePatient')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.CREATED)
  async removePatient(
    @Req() request: Request | any,
    @Body() dto: AddPatientToRepresentative,
  ) {
    return this.representativesService.removePatient(
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
  //   return this.patientsService.changeStatus(
  //     dto,
  //     request.user?._id,
  //     request.user?.roles,
  //   );
  // }
}
