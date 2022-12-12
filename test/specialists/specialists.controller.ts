import { UpdateSpecialistDto } from '../../src/common/dtos/specialist.dto';
import { GetRequestDto } from '../../src/common/dtos/getRequest.dto';
import {
  SpecialistTypeRemoveDto,
  SpecialistTypeDto,
  SpecialistTypesQueryDto,
  SpecialistDto,
} from '../../src/common/dtos';
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
  Req,
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

  @Put('add')
  @Roles('registrator', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async addSpecialist(
    @Req() request: Request | any,
    @Body() dto: SpecialistDto,
  ): Promise<object> {
    return this.specialistsService.addSpecialist(dto, request.user?.roles);
  }

  @Get('get')
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async getSpecialist(
    @Query() dto: GetRequestDto,
    @Res({ passthrough: true }) res: Response,
    //@Body() dto: SpecialistTypesQueryDto,
  ): Promise<SpecialistDto[]> {
    const response = await this.specialistsService.getSpecialists(dto);
    res.setHeader('X-Total-Count', response.count);
    //res.set('X-Total-Count', '100');
    console.log(dto);

    return response.data;
  }

  @Put('update')
  @Roles('registrator', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async updateSpecialist(@Body() dto: UpdateSpecialistDto): Promise<object> {
    return this.specialistsService.updateSpecialist(dto);
  }

  // @Public()
  @Post('types/update')
  @Roles('registrator', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async editSpecialistType(@Body() dto: SpecialistTypeDto): Promise<object> {
    return this.specialistsService.editSpecialistType(dto);
  }

  //@Public()
  @Delete('types/remove')
  @Roles('registrator', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async removeSpecialistType(
    @Body() dto: SpecialistTypeRemoveDto,
  ): Promise<string> {
    return this.specialistsService.removeSpecialistType(dto);
  }
}
