import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Patient, PatientSchema } from 'src/common/schemas';
import { Connection } from 'mongoose';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [AddressController],
  providers: [AddressService],
  imports: [HttpModule],
})
export class AddressModule {}
