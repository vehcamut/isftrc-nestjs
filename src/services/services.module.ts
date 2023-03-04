import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
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
  UserSchema,
  User,
} from '../common/schemas';
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
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [ServicesService],
})
export class ServicesModule {}
