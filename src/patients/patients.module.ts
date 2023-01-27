import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import {
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
} from 'src/common/schemas';
import { Connection } from 'mongoose';

@Module({
  controllers: [PatientsController],
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Service.name, schema: ServiceSchema },
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
  providers: [PatientsService],
})
export class PatientsModule {}
