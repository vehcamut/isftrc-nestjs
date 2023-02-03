import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import {
  AdvertisingSource,
  AdvertisingSourcesSchema,
  Appointment,
  AppointmentSchema,
  Service,
  ServiceGroup,
  ServiceGroupSchema,
  ServiceSchema,
  ServiceType,
  ServiceTypeSchema,
  SpecialistType,
  SpecialistTypeSchema,
} from 'src/common/schemas';
import { Connection } from 'mongoose';

@Module({
  controllers: [ServicesController],
  imports: [
    MongooseModule.forFeature([
      { name: ServiceGroup.name, schema: ServiceGroupSchema },
      { name: ServiceType.name, schema: ServiceTypeSchema },
      { name: SpecialistType.name, schema: SpecialistTypeSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Appointment.name, schema: AppointmentSchema },
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
  providers: [ServicesService],
})
export class ServicesModule {}
