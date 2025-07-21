# Real-Time Chat Application

A real-time chat application built with NestJS, MySQL, AWS Lambda, and WebSockets.

## Features

- Real-time messaging using WebSockets with Socket.IO
- Message persistence in MySQL database with TypeORM
- AWS Lambda integration for message processing
- REST API for message history with pagination
- Simple HTML frontend for testing

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MySQL database
- AWS account with Lambda access

### 1. Clone the Repository

```bash
git clone <repository-url>
cd chat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp env.example .env
```

Edit `.env` file with your configuration:

```env
NODE_ENV=development
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=chat_user
DATABASE_PASSWORD=chat_password
DATABASE_NAME=chat_app
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_LAMBDA_FUNCTION_NAME=message-processor
```

### 4. Set Up Database

```bash
npm run migration:run
```

### 5. Start the Application

```bash
npm run start:dev
```

## API Endpoints

- `GET /` - Frontend application
- `GET /health` - Health check
- `GET /messages` - Get message history with pagination
- `POST /messages` - Create a new message

## WebSocket Events

- `joinRoom` - Join chat room
- `leaveRoom` - Leave chat room
- `sendMessage` - Send message
- `typing` - Typing indicator

## AWS Lambda Integration

The application includes AWS Lambda integration for message processing:

1. Create AWS Account and IAM user
2. Deploy Lambda function using provided code in `lambda/` folder
3. Update environment variables with AWS credentials
4. Test integration

## Deployment

For deployment on cloud platforms, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Testing

```bash
npm run test
npm run test:e2e
```

## License

MIT License
