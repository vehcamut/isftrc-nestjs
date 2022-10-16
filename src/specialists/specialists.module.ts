import {
  Specialist,
  SpecialistSchema,
  SpecialistType,
  SpecialistTypeSchema,
} from '../common/schemas';
import { SpecialistsController } from './specialists.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { SpecialistsService } from './specialists.service';

@Module({
  providers: [SpecialistsService],
  imports: [
    MongooseModule.forFeature([
      { name: SpecialistType.name, schema: SpecialistTypeSchema },
      { name: Specialist.name, schema: SpecialistSchema },
    ]),
  ],
  controllers: [SpecialistsController],
})
export class SpecialistsModule {}
