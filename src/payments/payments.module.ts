import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import {
  AdvertisingSource,
  AdvertisingSourcesSchema,
  Appointment,
  AppointmentSchema,
  Patient,
  PatientSchema,
  Payment,
  PaymentSchema,
  Service,
  ServiceGroup,
  ServiceGroupSchema,
  ServiceSchema,
  ServiceType,
  ServiceTypeSchema,
  SpecialistType,
  SpecialistTypeSchema,
  User,
  UserSchema,
} from 'src/common/schemas';
import { Connection } from 'mongoose';

@Module({
  controllers: [PaymentsController],
  imports: [
    MongooseModule.forFeature([
      { name: ServiceGroup.name, schema: ServiceGroupSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: User.name, schema: UserSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Payment.name, schema: PaymentSchema },
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
  providers: [PaymentsService],
})
export class PaymentsModule {}
