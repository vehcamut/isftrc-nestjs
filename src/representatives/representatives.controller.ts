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
import {
  Body,
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
import { AtGuard } from 'src/common/guards';

@Controller('representatives')
export class RepresentativesController {
  constructor(
    private readonly representativesService: RepresentativesService,
  ) {}

  // @UseGuards(AtGuard)
  // @Roles('admin', 'representative', 'specialist')

  @Get('get')
  @UseGuards(AtGuard)
  @Roles('admin')
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
  @UseGuards(AtGuard)
  @Roles('admin')
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
  // @UseGuards(AtGuard)
  // @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async add(@Req() request: Request | any, @Body() dto: AddRepresentativeDto) {
    return this.representativesService.add(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  @Put('update')
  @UseGuards(AtGuard)
  @Roles('admin', 'representative')
  @HttpCode(HttpStatus.OK)
  async update(
    @Req() request: Request | any,
    @Body() dto: RepresentativeWithIdDto,
  ) {
    return this.representativesService.update(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  @Get('patients')
  @UseGuards(AtGuard)
  @Roles('admin')
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
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async addPatient(
    @Req() request: Request | any,
    @Body() dto: AddPatientToRepresentative,
  ) {
    return this.representativesService.addPatient(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  @Post('removePatient')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async removePatient(
    @Req() request: Request | any,
    @Body() dto: AddPatientToRepresentative,
  ) {
    return this.representativesService.removePatient(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  @Patch('changeStatus')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async changeStatus(
    @Req() request: Request | any,
    @Body() dto: PatientChangeStatusDto,
  ) {
    return this.representativesService.changeStatus(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }
}
