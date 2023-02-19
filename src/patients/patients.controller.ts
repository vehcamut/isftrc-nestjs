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
  AddServiceDto,
  CourseWithServicesDto,
  GetPatientRepresentativesDto,
  GetPatientsByIdDto,
  GetPatientsDto,
  GetRequestDto,
  PatientBaseDto,
  PatientChangeStatusDto,
  PatientCoursesInfo,
  PatientWithIdDto,
  RemoveServiceDto,
  getCoursesDto,
  patientCourseDto,
} from 'src/common/dtos';
import { PatientsService } from './patients.service';
import { AtGuard } from 'src/common/guards';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get('get')
  @UseGuards(AtGuard)
  @Roles('admin', 'representative', 'spesialist')
  @HttpCode(HttpStatus.OK)
  async get(
    @Req() request: Request | any,
    @Query() dto: GetPatientsDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PatientBaseDto[]> {
    const response = await this.patientsService.get(
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
    @Req() request: Request | any,
    @Query() dto: GetPatientsByIdDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PatientBaseDto> {
    return await this.patientsService.getById(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  @Get('getPatientRepresentatives')
  @UseGuards(AtGuard)
  @Roles('admin', 'representative', 'specialist')
  @HttpCode(HttpStatus.OK)
  async getPatientRepresentatives(
    @Req() request: Request | any,
    @Query() dto: GetPatientRepresentativesDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PatientBaseDto[]> {
    const response = await this.patientsService.getPatientRepresentatives(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
    res.setHeader('X-Total-Count', response.count);
    return response.data;
  }

  @Post('add')
  @UseGuards(AtGuard)
  @Roles('admin', 'representative')
  @HttpCode(HttpStatus.CREATED)
  async add(@Req() request: Request | any, @Body() dto: PatientBaseDto) {
    return this.patientsService.add(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  @Put('update')
  @UseGuards(AtGuard)
  @Roles('admin', 'representative')
  @HttpCode(HttpStatus.OK)
  async update(@Req() request: Request | any, @Body() dto: PatientWithIdDto) {
    return this.patientsService.update(
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
    return this.patientsService.changeStatus(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  // открыть новый курс, если закрыт
  @Post('newCourse')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async newCourse(
    @Req() request: Request | any,
    @Body() dto: patientCourseDto,
  ) {
    return this.patientsService.newCourse(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  // добавить услугу в курс
  @Post('addService')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async addService(@Req() request: Request | any, @Body() dto: AddServiceDto) {
    return this.patientsService.addService(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  // удалить неоказаную и незаписаную услугу из курса
  @Delete('removeService')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async removeService(
    @Req() request: Request | any,
    @Body() dto: RemoveServiceDto,
  ) {
    return this.patientsService.removeService(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  // закрыть последний курс, если закрыт
  @Post('closeCourse')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async closeCourse(
    @Req() request: Request | any,
    @Body() dto: patientCourseDto,
  ) {
    return this.patientsService.closeCourse(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  // открыть новый курс, если закрыт
  @Post('openCourse')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async openCourse(
    @Req() request: Request | any,
    @Body() dto: patientCourseDto,
  ) {
    return this.patientsService.openCourse(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  @Get('getCourses')
  @UseGuards(AtGuard)
  @Roles('admin', 'representative', 'specialist')
  @HttpCode(HttpStatus.OK)
  async getCourses(
    @Req() request: Request | any,
    @Query() dto: getCoursesDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PatientCoursesInfo> {
    const response = await this.patientsService.getCourses(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
    return response;
  }
}
