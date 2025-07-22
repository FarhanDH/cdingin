import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { configuration } from './common/configuration';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  const logger: Logger = new Logger('Info');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  );

  const frontendUrl =
    configuration().env === 'production'
      ? configuration().frontendUrl
      : 'http://localhost:5173';

  app.enableCors({
    origin: frontendUrl,
    methods: 'GET, HEAD, PUT, POST, DELETE, OPTIONS, PATCH',
    credentials: true,
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authentication, Access-control-allow-credentials, Access-control-allow-headers, Access-control-allow-methods, Access-control-allow-origin, User-Agent, Referer, Accept-Encoding, Accept-Language, Access-Control-Request-Headers, Cache-Control, Pragma',
  });

  app.setGlobalPrefix('api');
  console.log('CORS allowed origin:', frontendUrl);

  app.useStaticAssets(join(__dirname, '..', 'src/core/email/templates/assets'));
  app.setBaseViewsDir(join(__dirname, '..', 'src/core/email/templates'));
  app.setViewEngine('hbs');

  await app
    .listen(configuration().port)
    .then(() =>
      logger.log(`server started 🚀 on port ${configuration().port}`),
    );
}
bootstrap();
