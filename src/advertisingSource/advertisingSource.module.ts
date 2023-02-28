import { Module } from '@nestjs/common';
import { AdvertisingSourceService } from './advertisingSource.service';
import { AdvertisingSourceController } from './advertisingSource.controller';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { AdvertisingSource, AdvertisingSourcesSchema } from '../common/schemas';
import { Connection } from 'mongoose';

@Module({
  controllers: [AdvertisingSourceController],
  imports: [
    MongooseModule.forFeature([
      { name: AdvertisingSource.name, schema: AdvertisingSourcesSchema },
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
  providers: [AdvertisingSourceService],
})
export class AdvertisingSourceModule {}
