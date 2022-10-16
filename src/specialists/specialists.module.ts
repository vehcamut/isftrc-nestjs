import {
  SpecialistType,
  SpecialistTypeSchema,
} from './schemas/specialist-types.schema';
import { SpecialistsController } from './specialists.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { SpecialistsService } from './specialists.service';

@Module({
  providers: [SpecialistsService],
  imports: [
    MongooseModule.forFeature([
      { name: SpecialistType.name, schema: SpecialistTypeSchema },
    ]),
  ],
  controllers: [SpecialistsController],
})
export class SpecialistsModule {}
