import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';
import { DatabaseConfig } from './config/database.config';
import { AppController } from './app.controller';
import { validationSchema } from './config/env.validation';
import { databaseConfig, awsConfig, appConfig } from './config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      load: [databaseConfig, awsConfig, appConfig],
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    ChatModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
