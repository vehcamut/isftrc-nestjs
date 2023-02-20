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
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common/decorators';
import { Response } from 'express';
import { Public, Roles } from 'src/common/decorators';
import {
  AddAdminDto,
  AddRepresentativeDto,
  AdminChangeStatusDto,
  AdminWithIdDto,
  GetAdminsDto,
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
import { AdminsService } from './admins.service';
import { IPatient } from 'src/common/interfaces';
import { AtGuard } from 'src/common/guards';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get('get')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async get(
    @Req() request: Request | any,
    @Query() dto: GetAdminsDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserBaseDto[]> {
    const response = await this.adminsService.get(
      dto,
      request.user?._id,
      request.user?.roles,
    );
    res.setHeader('X-Total-Count', response.count);
    return response.data;
  }

  @Get('getById')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async getById(
    @Req() request: Request | any,
    @Query() dto: GetRepresentativesByIdDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserBaseDto> {
    return await this.adminsService.getById(
      dto,
      request.user?._id,
      request.user?.roles,
    );
  }

  @Post('add')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async add(@Req() request: Request | any, @Body() dto: AddAdminDto) {
    return this.adminsService.add(dto, request.user?._id, request.user?.roles);
  }

  @Put('update')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async update(@Req() request: Request | any, @Body() dto: AdminWithIdDto) {
    return this.adminsService.update(
      dto,
      request.user?._id,
      request.user?.roles,
    );
  }

  @Patch('changeStatus')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async changeStatus(
    @Req() request: Request | any,
    @Body() dto: AdminChangeStatusDto,
  ) {
    return this.adminsService.changeStatus(
      dto,
      request.user?._id,
      request.user?.roles,
    );
  }
}
