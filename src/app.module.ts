import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

@Module({
  imports: [MongooseModule.forRoot(process.env.DATABASE_URL)],
  controllers: [],
  providers: [],
})
export class AppModule {}
