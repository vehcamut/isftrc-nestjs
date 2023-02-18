import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
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
  controllers: [AdminsController],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
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
  providers: [AdminsService],
})
export class AdminsModule {}
