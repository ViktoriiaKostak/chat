import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IMessage, IProcessedMessage } from '../interfaces/message.interface';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

@Injectable()
export class AwsLambdaService {
  private readonly logger = new Logger(AwsLambdaService.name);
  private readonly lambda: LambdaClient | null = null;
  private readonly isEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('aws.accessKeyId');
    const secretAccessKey = this.configService.get<string>('aws.secretAccessKey');
    
    this.isEnabled = !!(accessKeyId && secretAccessKey);
    
    if (this.isEnabled) {
      this.lambda = new LambdaClient({
        region: this.configService.get<string>('aws.region'),
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log('AWS Lambda service enabled');
    } else {
      this.logger.log('AWS Lambda service disabled - no credentials provided');
    }
  }

  async processMessage(message: IMessage): Promise<IProcessedMessage> {
    if (!this.isEnabled || !this.lambda) {
      this.logger.log('AWS Lambda disabled, returning original message');
      return {
        ...message,
        processedContent: message.content,
        processingTimestamp: new Date(),
        metadata: {
          ...message.metadata,
          lambdaProcessing: {
            success: false,
            error: 'AWS Lambda service disabled',
          },
        },
      };
    }

    try {
      this.logger.log(`Processing message: ${message.id}`);

      const functionName = this.configService.get<string>(
        'aws.lambdaFunctionName',
      );
      const payload = JSON.stringify({
        messageId: message.id,
        content: message.content,
        userId: message.userId,
        room: message.room,
        timestamp: message.timestamp,
      });

      const command = new InvokeCommand({
        FunctionName: functionName,
        Payload: new TextEncoder().encode(payload),
      });

      const response = await this.lambda.send(command);

      if (response.StatusCode !== 200) {
        throw new Error(
          `Lambda invocation failed with status: ${response.StatusCode}`,
        );
      }

      const responsePayload = JSON.parse(
        new TextDecoder().decode(response.Payload),
      );
      const lambdaResponse = JSON.parse(responsePayload.body);

      this.logger.log(`Message processed successfully by Lambda`);

      return {
        ...message,
        processedContent: lambdaResponse.processedContent,
        processingTimestamp: new Date(),
        metadata: {
          ...message.metadata,
          lambdaProcessing: {
            success: true,
            processingTime: lambdaResponse.processingTime,
            sanitized: lambdaResponse.sanitized,
          },
        },
      };
    } catch (error) {
      this.logger.error('Failed to process message with Lambda', error);

      return {
        ...message,
        processedContent: message.content,
        processingTimestamp: new Date(),
        metadata: {
          ...message.metadata,
          lambdaProcessing: {
            success: false,
            error: error.message,
          },
        },
      };
    }
  }
}
