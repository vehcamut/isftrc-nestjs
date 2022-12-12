import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Patient, PatientSchema } from 'src/common/schemas';
import { Connection } from 'mongoose';

@Module({
  controllers: [PatientsController],
  imports: [
    MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }]),
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
