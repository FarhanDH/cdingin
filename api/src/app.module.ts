import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { configuration } from './common/configuration';
import { DatabaseModule } from './core/database/database.module';
import { AppLoggerMiddleware } from './common/loggers/logger.middleware';
import { UserModule } from './core/user/user.module';
import { AuthModule } from './core/auth/auth.module';
import { EmailModule } from './core/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
    EmailModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
