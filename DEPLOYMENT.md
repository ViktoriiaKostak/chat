# Chat Application Deployment

This project is deployed on Heroku. Follow the instructions below to deploy your own instance.

## 🚀 Heroku Deployment

1. **Install Heroku CLI**
2. **Sign up on Heroku**: https://heroku.com
3. **Run commands**:
```bash
heroku create your-chat-app
heroku config:set NODE_ENV=production
heroku config:set DATABASE_HOST=your-db-host
heroku config:set DATABASE_PORT=3306
heroku config:set DATABASE_USERNAME=your-username
heroku config:set DATABASE_PASSWORD=your-password
heroku config:set DATABASE_NAME=your-database
git push heroku main
```

## 🔧 Environment Variables

Configure the following environment variables:

```env
NODE_ENV=production
PORT=3000
DATABASE_HOST=your-database-host
DATABASE_PORT=3306
DATABASE_USERNAME=your-database-username
DATABASE_PASSWORD=your-database-password
DATABASE_NAME=your-database-name
```

## 📝 After Deployment

1. **Check health check**: `https://your-app-url/health`
2. **Test API**: `https://your-app-url/messages`
3. **Configure WebSocket connection** for chat

## 🔍 Monitoring

- Check application logs
- Set up alerts for errors
- Monitor resource usage 