//import { AtGuard } from './common/guards';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger/dist';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

const whitelist = [
  'http://192.168.1.49:3333',
  'http://192.168.1.49:3000',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8080',
  'http://localhost',
  'http://bubnovsky30.hopto.org',
  'http://bubnovsky30admin.hopto.org',
  'https://isftrc-nestjs.vercel.app',
  'https://isftrc-react-redux.vercel.app',
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
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
  const config = new DocumentBuilder()
    .setTitle('ISFTRC API')
    .setDescription('Documentation')
    .setVersion('1.0')
    .addTag('Личный кабинет')
    //.addCookieAuth('refreshToken')
    .addCookieAuth('accessToken')

    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const PORT = process.env.PORT;
  console.log(`Server started on port ${process.env.DATABASE_URI}`),
    await app.listen(PORT, '0.0.0.0', () =>
      console.log(`Server started on port ${PORT}`),
    );
}
bootstrap();
