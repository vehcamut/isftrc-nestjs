import {
  SpecialistTypeRemoveDto,
  SpecialistTypeDto,
  SpecialistTypesQueryDto,
  SpecialistDto,
} from '../common/dtos';
import {
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Post,
  Delete,
  Put,
} from '@nestjs/common';
import {
  Body,
  Query,
  Res,
} from '@nestjs/common/decorators/http/route-params.decorator';
import { Public, Roles } from 'src/common/decorators';
import { SpecialistsService } from './specialists.service';
import { Response } from 'express';

@Controller('specialists')
export class SpecialistsController {
  constructor(private specialistsService: SpecialistsService) {}

  // @Public()
  @Get('types/get')
  @Roles('registrator')
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

  // @Public()
  @Put('types/add')
  @Roles('registrator')
  @HttpCode(HttpStatus.CREATED)
  async addSpecialistType(@Body() dto: SpecialistTypeDto): Promise<object> {
    return this.specialistsService.addSpecialistType(dto);
  }

  @Public()
  @Put('add')
  //@Roles('registrator')
  @HttpCode(HttpStatus.CREATED)
  async addSpecialist(@Body() dto: SpecialistDto): Promise<object> {
    return this.specialistsService.addSpecialist(dto);
  }

  // @Public()
  @Post('types/update')
  @Roles('registrator')
  @HttpCode(HttpStatus.CREATED)
  async editSpecialistType(@Body() dto: SpecialistTypeDto): Promise<object> {
    return this.specialistsService.editSpecialistType(dto);
  }

  //@Public()
  @Delete('types/remove')
  @Roles('registrator')
  @HttpCode(HttpStatus.CREATED)
  async removeSpecialistType(
    @Body() dto: SpecialistTypeRemoveDto,
  ): Promise<string> {
    return this.specialistsService.removeSpecialistType(dto);
  }
}
