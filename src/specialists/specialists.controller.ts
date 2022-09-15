import { SpecialistTypesDto, SpecialistTypesQueryDto } from './dto';
import { Controller, HttpCode, HttpStatus, Get, Post } from '@nestjs/common';
import {
  Body,
  Query,
  Res,
} from '@nestjs/common/decorators/http/route-params.decorator';
import { Public } from 'src/common/decorators';
import { SpecialistsService } from './specialists.service';

@Controller('specialists')
export class SpecialistsController {
  constructor(private specialistsService: SpecialistsService) {}

  @Public()
  @Get('types')
  @HttpCode(HttpStatus.FOUND)
  async getSpecialistTypes(
    @Body() dto: SpecialistTypesQueryDto,
  ): Promise<SpecialistTypesDto[]> {
    return this.specialistsService.getSpecialistTypes(dto);
  }
}
