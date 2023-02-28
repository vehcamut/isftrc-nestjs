import {
  SpecialistType,
  SpecialistTypeSchema,
} from './../common/schemas/specialistType.schema';
import { Module } from '@nestjs/common';
import { SpecialistsService } from './specialists.service';
import { SpecialistsController } from './specialists.controller';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
  Patient,
  PatientSchema,
  AdvertisingSource,
  AdvertisingSourcesSchema,
  ServiceType,
  ServiceTypeSchema,
} from '../common/schemas';
import { Connection } from 'mongoose';

@Module({
  controllers: [SpecialistsController],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: SpecialistType.name, schema: SpecialistTypeSchema },
      { name: ServiceType.name, schema: ServiceTypeSchema },
    ]),
    // MongooseModule.forFeatureAsync([
    //   {
    //     name: Patient.name,
    //     useFactory: async (connection: Connection) => {
    //       const schema = PatientSchema;
    //       const AutoIncrement = require('mongoose-sequence')(connection);
    //       schema.plugin(AutoIncrement, { inc_field: 'number' });
    //       return schema;
    //     },
    //     inject: [getConnectionToken()],
    //   },
    // ]),
  ],
  providers: [SpecialistsService],
})
export class SpecialistsModule {}
