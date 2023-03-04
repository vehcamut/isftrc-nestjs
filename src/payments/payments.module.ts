import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Patient,
  PatientSchema,
  Payment,
  PaymentSchema,
  Service,
  ServiceGroup,
  ServiceGroupSchema,
  ServiceSchema,
  User,
  UserSchema,
} from '../common/schemas';

@Module({
  controllers: [PaymentsController],
  imports: [
    MongooseModule.forFeature([
      { name: ServiceGroup.name, schema: ServiceGroupSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: User.name, schema: UserSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  providers: [PaymentsService],
})
export class PaymentsModule {}
