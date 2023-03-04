import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Appointment,
  AppointmentSchema,
  Patient,
  PatientSchema,
  User,
  UserSchema,
  Course,
  CourseSchema,
  Service,
  ServiceSchema,
  ServiceType,
  ServiceTypeSchema,
  PaymentSchema,
  Payment,
} from '../common/schemas';

@Module({
  controllers: [PatientsController],
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: ServiceType.name, schema: ServiceTypeSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  providers: [PatientsService],
})
export class PatientsModule {}
