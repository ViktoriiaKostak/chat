#!/bin/bash

FUNCTION_NAME="message-processor"
REGION="us-east-1"
RUNTIME="nodejs18.x"
HANDLER="index.handler"

echo "Building Lambda function..."

cd message-processor

echo "Creating deployment package..."
zip -r ../function.zip .

cd ..

echo "Deploying Lambda function..."

aws lambda create-function \
    --function-name $FUNCTION_NAME \
    --runtime $RUNTIME \
    --handler $HANDLER \
    --zip-file fileb://function.zip \
    --region $REGION \
    --timeout 30 \
    --memory-size 128 \
    --description "Process chat messages" \
    || aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://function.zip \
        --region $REGION

echo "Cleaning up..."
rm function.zip

echo "Lambda function deployed successfully!" 