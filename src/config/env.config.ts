import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface AwsConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  lambdaFunctionName: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
}

export const databaseConfig = registerAs(
  'database',
  (): DatabaseConfig => ({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'chat_app',
  }),
);

export const awsConfig = registerAs(
  'aws',
  (): AwsConfig => ({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    lambdaFunctionName:
      process.env.AWS_LAMBDA_FUNCTION_NAME || 'chat-message-processor',
  }),
);

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  }),
);
