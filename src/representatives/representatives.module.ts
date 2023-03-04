import { Module } from '@nestjs/common';
import { RepresentativesService } from './representatives.service';
import { RepresentativesController } from './representatives.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
  Patient,
  PatientSchema,
  AdvertisingSource,
  AdvertisingSourcesSchema,
} from '../common/schemas';

@Module({
  controllers: [RepresentativesController],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AdvertisingSource.name, schema: AdvertisingSourcesSchema },
      { name: Patient.name, schema: PatientSchema },
    ]),
  ],
  providers: [RepresentativesService],
})
export class RepresentativesModule {}
