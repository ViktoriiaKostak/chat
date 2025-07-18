import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpStatus,
  HttpException,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { GetMessagesDto } from '../dto/get-messages.dto';

@Controller('messages')
@UsePipes(new ValidationPipe({ transform: true }))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createMessage(@Body() createMessageDto: CreateMessageDto) {
    try {
      const message = await this.chatService.createMessage(createMessageDto);
      return {
        success: true,
        data: message,
        message: 'Message created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create message',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async getMessages(@Query() getMessagesDto: GetMessagesDto) {
    try {
      const result = await this.chatService.getMessages(getMessagesDto);
      return {
        success: true,
        data: result,
        message: 'Messages retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve messages',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
