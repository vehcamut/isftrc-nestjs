import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import { Body, Post, Put, Req } from '@nestjs/common/decorators';
import { Response } from 'express';
import { Public } from '../common/decorators';
import {
  GetSpecialistTypeDto,
  SpecialistTypeDto,
  SpecialistTypeWithIdDto,
} from '../common/dtos';
import { SpecialistTypeService } from './specialistType.service';

@Controller('specialistType')
export class SpecialistTypeController {
  constructor(private readonly specialistTypeService: SpecialistTypeService) {}

  @Get('get')
  @Public()
  @HttpCode(HttpStatus.OK)
  async get(
    @Query() dto: GetSpecialistTypeDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SpecialistTypeWithIdDto[]> {
    const response = await this.specialistTypeService.get(dto);
    res.setHeader('X-Total-Count', response.count);
    return response.data;
  }

  @Post('add')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async add(@Req() request: Request | any, @Body() dto: SpecialistTypeDto) {
    return this.specialistTypeService.add(
      dto,
      request.user?._id,
      request.user?.roles,
    );
  }

  @Put('update')
  @Public()
  @HttpCode(HttpStatus.OK)
  async update(
    @Req() request: Request | any,
    @Body() dto: SpecialistTypeWithIdDto,
  ) {
    return this.specialistTypeService.update(
      dto,
      request.user?._id,
      request.user?.roles,
    );
  }
}
