import { SpecialistType, SpecialistTypeSchema } from './../common/schemas';
import { Module } from '@nestjs/common';
import { SpecialistTypeController } from './specialistType.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SpecialistTypeService } from './specialistType.service';

@Module({
  controllers: [SpecialistTypeController],
  imports: [
    MongooseModule.forFeature([
      { name: SpecialistType.name, schema: SpecialistTypeSchema },
    ]),
  ],
  providers: [SpecialistTypeService],
})
export class SpecialistTypeModule {}
