import { PaymentsModule } from './payments/payments.module';
import { RepresentativesModule } from './representatives/representatives.module';
import { AtGuard, RolesGuard } from './common/guards';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
//import { SpecialistsModule } from '../test/specialists/specialists.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { AddressModule } from './address/address.module';
import { AdvertisingSourceModule } from './advertisingSource/advertisingSource.module';
import { SpecialistTypeModule } from './specialistType/specialistType.module';
import { SpecialistsModule } from './specialists/specialists.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ServicesModule } from './services/services.module';
import { AdminsModule } from './admins/admins.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'build'),
    }),
    MongooseModule.forRoot(process.env.DATABASE_URI),
    AdminsModule,
    AuthModule,
    AdvertisingSourceModule,
    RepresentativesModule,
    SpecialistTypeModule,
    SpecialistsModule,
    UsersModule,
    PatientsModule,
    AddressModule,
    AppointmentsModule,
    ServicesModule,
    PaymentsModule,
  ],
  controllers: [],
  //провайдер защит jwt для инъекции
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
