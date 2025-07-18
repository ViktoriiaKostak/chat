const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

exports.handler = async (event) => {
  try {
    let messageData;

    if (typeof event === 'string') {
      messageData = JSON.parse(event);
    } else if (event.body) {
      messageData =
        typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } else {
      messageData = event;
    }

    const processedContent = sanitizeContent(messageData.content);

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        messageId: messageData.id,
        processedContent: processedContent,
        timestamp: new Date().toISOString(),
        metadata: {
          originalLength: messageData.content.length,
          processedLength: processedContent.length,
          sanitized: true,
        },
      }),
    };

    return response;
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process message',
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};

function sanitizeContent(content) {
  if (!content || typeof content !== 'string') {
    return content;
  }

  let sanitized = content
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000) + '...';
  }

  return sanitized;
}
