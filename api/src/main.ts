import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { configuration } from './common/configuration';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger: Logger = new Logger('Info');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  );

  app.setGlobalPrefix('api');
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
