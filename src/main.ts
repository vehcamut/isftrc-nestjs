//import { AtGuard } from './common/guards';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

const whitelist = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8080',
  'http://localhost',
  'http://bubnovsky30.hopto.org',
  'http://bubnovsky30admin.hopto.org',
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    exposedHeaders: 'Content-Range',
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
        console.log('Not allowed by CORS');
      }
    },
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(cookieParser());
  //app.useGlobalGuards(new AtGuard());
  const PORT = process.env.PORT;

  await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
bootstrap();
