//import { AtGuard } from './common/guards';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  //app.useGlobalGuards(new AtGuard());
  const PORT = process.env.PORT;

  await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
bootstrap();
