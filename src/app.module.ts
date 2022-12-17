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
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URI),
    AuthModule,
    AdvertisingSourceModule,
    //SpecialistsModule,
    UsersModule,
    PatientsModule,
    AddressModule,
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
