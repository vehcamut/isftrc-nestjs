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
  async get(@Query() dto: addressGetDto): Promise<{ value: string }[]> {
    return this.addressService.getAddresses(dto);
  }
}
