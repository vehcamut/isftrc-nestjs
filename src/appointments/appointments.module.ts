import {
  Appointment,
  AppointmentSchema,
} from './../common/schemas/appointment.schema';
import {
  SpecialistType,
  SpecialistTypeSchema,
} from '../common/schemas/specialistType.schema';
import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
  Patient,
  PatientSchema,
  AdvertisingSource,
  AdvertisingSourcesSchema,
} from 'src/common/schemas';
import { Connection } from 'mongoose';

@Module({
  controllers: [AppointmentsController],
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: User.name, schema: UserSchema },
      // { name: SpecialistType.name, schema: SpecialistTypeSchema },
    ]),
  ],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
