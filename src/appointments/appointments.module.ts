import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Service,
  Appointment,
  AppointmentSchema,
  User,
  UserSchema,
  Patient,
  PatientSchema,
  ServiceSchema,
} from '../common/schemas';

@Module({
  controllers: [AppointmentsController],
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: User.name, schema: UserSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Patient.name, schema: PatientSchema },
    ]),
  ],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
