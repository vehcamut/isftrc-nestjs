import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [AddressController],
  providers: [AddressService],
  imports: [HttpModule],
})
export class AddressModule {}
