import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { Public } from '../common/decorators';
import { addressGetDto } from '../common/dtos';
import { AddressService } from './address.service';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  async get(@Query() dto: addressGetDto): Promise<{ value: string }[]> {
    return this.addressService.getAddresses(dto);
  }
}
