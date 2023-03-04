import { Module } from '@nestjs/common';
import { AdvertisingSourceService } from './advertisingSource.service';
import { AdvertisingSourceController } from './advertisingSource.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AdvertisingSource, AdvertisingSourcesSchema } from '../common/schemas';

@Module({
  controllers: [AdvertisingSourceController],
  imports: [
    MongooseModule.forFeature([
      { name: AdvertisingSource.name, schema: AdvertisingSourcesSchema },
    ]),
  ],
  providers: [AdvertisingSourceService],
})
export class AdvertisingSourceModule {}
