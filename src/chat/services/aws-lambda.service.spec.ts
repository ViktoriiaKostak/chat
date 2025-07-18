import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AwsLambdaService } from './aws-lambda.service';
import { IMessage } from '../interfaces/message.interface';
import { LambdaClient } from '@aws-sdk/client-lambda';

jest.mock('@aws-sdk/client-lambda');

describe('AwsLambdaService', () => {
  let service: AwsLambdaService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockLambdaClient = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AwsLambdaService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AwsLambdaService>(AwsLambdaService);

    // Mock the Lambda client
    (LambdaClient as jest.MockedClass<typeof LambdaClient>).mockImplementation(
      () => mockLambdaClient as any,
    );

    // Mock the lambda property
    (service as any).lambda = mockLambdaClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processMessage', () => {
    it('should process message successfully', async () => {
      const mockMessage: IMessage = {
        id: 'test-id',
        userId: 'test-user',
        content: 'Test message',
        room: 'general',
        timestamp: new Date(),
        updatedAt: new Date(),
      };

      const mockLambdaResponse = {
        StatusCode: 200,
        Payload: new TextEncoder().encode(
          JSON.stringify({
            statusCode: 200,
            body: JSON.stringify({
              processedContent: 'Processed test message',
              processingTime: 100,
              sanitized: true,
            }),
          }),
        ),
      };

      mockConfigService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'aws.region':
            return 'us-east-1';
          case 'aws.accessKeyId':
            return 'test-access-key';
          case 'aws.secretAccessKey':
            return 'test-secret-key';
          case 'aws.lambdaFunctionName':
            return 'message-processor';
          default:
            return undefined;
        }
      });

      mockLambdaClient.send.mockResolvedValue(mockLambdaResponse);

      const result = await service.processMessage(mockMessage);

      expect(result).toEqual({
        ...mockMessage,
        processedContent: 'Processed test message',
        processingTimestamp: expect.any(Date),
        metadata: {
          lambdaProcessing: {
            success: true,
            processingTime: 100,
            sanitized: true,
          },
        },
      });
    });

    it('should handle Lambda invocation failure', async () => {
      const mockMessage: IMessage = {
        id: 'test-id',
        userId: 'test-user',
        content: 'Test message',
        room: 'general',
        timestamp: new Date(),
        updatedAt: new Date(),
      };

      mockConfigService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'aws.region':
            return 'us-east-1';
          case 'aws.accessKeyId':
            return 'test-access-key';
          case 'aws.secretAccessKey':
            return 'test-secret-key';
          case 'aws.lambdaFunctionName':
            return 'message-processor';
          default:
            return undefined;
        }
      });

      mockLambdaClient.send.mockRejectedValue(new Error('Lambda error'));

      const result = await service.processMessage(mockMessage);

      expect(result).toEqual({
        ...mockMessage,
        processedContent: 'Test message',
        processingTimestamp: expect.any(Date),
        metadata: {
          lambdaProcessing: {
            success: false,
            error: 'Lambda error',
          },
        },
      });
    });

    it('should handle Lambda non-200 status code', async () => {
      const mockMessage: IMessage = {
        id: 'test-id',
        userId: 'test-user',
        content: 'Test message',
        room: 'general',
        timestamp: new Date(),
        updatedAt: new Date(),
      };

      const mockLambdaResponse = {
        StatusCode: 500,
        Payload: new TextEncoder().encode(
          JSON.stringify({
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal error' }),
          }),
        ),
      };

      mockConfigService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'aws.region':
            return 'us-east-1';
          case 'aws.accessKeyId':
            return 'test-access-key';
          case 'aws.secretAccessKey':
            return 'test-secret-key';
          case 'aws.lambdaFunctionName':
            return 'message-processor';
          default:
            return undefined;
        }
      });

      mockLambdaClient.send.mockResolvedValue(mockLambdaResponse);

      const result = await service.processMessage(mockMessage);

      expect(result).toEqual({
        ...mockMessage,
        processedContent: 'Test message',
        processingTimestamp: expect.any(Date),
        metadata: {
          lambdaProcessing: {
            success: false,
            error: 'Lambda invocation failed with status: 500',
          },
        },
      });
    });
  });
});
