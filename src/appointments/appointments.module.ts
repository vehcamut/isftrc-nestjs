import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import {
  Service,
  Appointment,
  AppointmentSchema,
  User,
  UserSchema,
  Patient,
  PatientSchema,
  AdvertisingSource,
  AdvertisingSourcesSchema,
  ServiceSchema,
} from 'src/common/schemas';
import { Connection } from 'mongoose';

@Module({
  controllers: [AppointmentsController],
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: User.name, schema: UserSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Patient.name, schema: PatientSchema },
      // { name: SpecialistType.name, schema: SpecialistTypeSchema },
    ]),
  ],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
