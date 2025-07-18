import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './controllers/chat.controller';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatService } from './services/chat.service';
import { AwsLambdaService } from './services/aws-lambda.service';
import { MessageRepository } from './repositories/message.repository';
import { Message } from './entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [ChatController],
  providers: [ChatService, AwsLambdaService, MessageRepository, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
