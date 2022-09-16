import { SpecialistTypeDto, SpecialistTypesQueryDto } from './dto';
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
  @Get('types/get')
  @HttpCode(HttpStatus.FOUND)
  async getSpecialistTypes(
    @Query() dto: SpecialistTypesQueryDto,
    //@Body() dto: SpecialistTypesQueryDto,
  ): Promise<SpecialistTypeDto[]> {
    console.log(dto);
    return this.specialistsService.getSpecialistTypes(dto);
  }

  @Public()
  @Post('types/add')
  @HttpCode(HttpStatus.CREATED)
  async addSpecialistType(@Body() dto: SpecialistTypeDto): Promise<string> {
    return this.specialistsService.addSpecialistType(dto);
  }
}
