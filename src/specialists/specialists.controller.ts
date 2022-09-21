import { SpecialistTypeDto, SpecialistTypesQueryDto } from './dto';
import { Controller, HttpCode, HttpStatus, Get, Post } from '@nestjs/common';
import {
  Body,
  Query,
  Res,
} from '@nestjs/common/decorators/http/route-params.decorator';
import { Public } from 'src/common/decorators';
import { SpecialistsService } from './specialists.service';
import { Response } from 'express';

@Controller('specialists')
export class SpecialistsController {
  constructor(private specialistsService: SpecialistsService) {}

  @Public()
  @Get('types/get')
  @HttpCode(HttpStatus.OK)
  async getSpecialistTypes(
    @Query() dto: SpecialistTypesQueryDto,
    @Res({ passthrough: true }) res: Response,
    //@Body() dto: SpecialistTypesQueryDto,
  ): Promise<SpecialistTypeDto[]> {
    const response = await this.specialistsService.getSpecialistTypes(dto);
    res.setHeader('X-Total-Count', response.count);
    //res.set('X-Total-Count', '100');
    console.log(dto);

    return response.data;
  }

  @Public()
  @Post('types/add')
  @HttpCode(HttpStatus.CREATED)
  async addSpecialistType(@Body() dto: SpecialistTypeDto): Promise<string> {
    return this.specialistsService.addSpecialistType(dto);
  }
}
