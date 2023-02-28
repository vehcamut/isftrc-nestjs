import {
  SpecialistType,
  SpecialistTypeSchema,
} from './../common/schemas/specialistType.schema';
import { Module } from '@nestjs/common';
import { SpecialistTypeController } from './specialistType.controller';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { AdvertisingSource, AdvertisingSourcesSchema } from '../common/schemas';
import { Connection } from 'mongoose';
import { SpecialistTypeService } from './specialistType.service';

@Module({
  controllers: [SpecialistTypeController],
  imports: [
    MongooseModule.forFeature([
      { name: SpecialistType.name, schema: SpecialistTypeSchema },
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
  providers: [SpecialistTypeService],
})
export class SpecialistTypeModule {}
