import {
  SpecialistTypes,
  SpecialistTypesSchema,
} from './shcemas/specialist-types.schema';
import { SpecialistsController } from './specialists.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { SpecialistsService } from './specialists.service';

@Module({
  providers: [SpecialistsService],
  imports: [
    MongooseModule.forFeature([
      { name: SpecialistTypes.name, schema: SpecialistTypesSchema },
    ]),
  ],
  controllers: [SpecialistsController],
})
export class SpecialistsModule {}
