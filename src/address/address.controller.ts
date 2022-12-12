import { SpecialistDto } from '../common/dtos/specialist.dto';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import { Body, Post, Req } from '@nestjs/common/decorators';
import { Response } from 'express';
import { Public } from 'src/common/decorators';
import { addressGetDto, GetRequestDto, PatientBaseDto } from 'src/common/dtos';
import { AddressService } from './address.service';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @Public()
  //@Roles('registrator')
  @HttpCode(HttpStatus.OK)
  async get(
    @Query() dto: addressGetDto,
    //  @Res({ passthrough: true }) res: Response,
  ): Promise<{ value: string }[]> {
    //const response = await this.patientsService.get(dto);
    //res.setHeader('X-Total-Count', response.count);
    //return response.data;
    return this.addressService.getAddresses(dto);
  }

  // @Post()
  // @Public()
  // //@Roles('registrator')
  // @HttpCode(HttpStatus.CREATED)
  // async getAddresses(@Body() dto: addressGetDto) {
  //   return this.addressService.getAddresses(dto);
  // }
}
