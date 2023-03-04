import {
  SpecialistType,
  SpecialistTypeSchema,
} from './../common/schemas/specialistType.schema';
import { Module } from '@nestjs/common';
import { SpecialistsService } from './specialists.service';
import { SpecialistsController } from './specialists.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
  ServiceType,
  ServiceTypeSchema,
} from '../common/schemas';

@Module({
  controllers: [SpecialistsController],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: SpecialistType.name, schema: SpecialistTypeSchema },
      { name: ServiceType.name, schema: ServiceTypeSchema },
    ]),
  ],
  providers: [SpecialistsService],
})
export class SpecialistsModule {}
