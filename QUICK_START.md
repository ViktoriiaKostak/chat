# Quick Start Guide

Get the chat application running in under 2 minutes with Docker!

## 🚀 One-Command Setup

```bash
# Clone and start everything
git clone <repository-url>
cd chat
docker compose up -d
```

That's it! Your application is now running at **http://localhost:3000**

## 📋 What You Get

✅ **Real-time chat** with WebSocket connections  
✅ **MySQL database** automatically created and configured  
✅ **Modern UI** with responsive design  
✅ **Multiple chat rooms** (general, music, tech)  
✅ **Message persistence** in database  
✅ **Hot reload** for development

## 🔧 Docker Commands

```bash
# Start the application
docker compose up -d

# View logs
docker compose logs -f

# Stop the application
docker compose down

# Restart everything
docker compose restart

# Clean up (removes database data)
docker compose down -v
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/messages
- **Health Check**: http://localhost:3000/health

## 🧪 Test the Application

1. **Open** http://localhost:3000 in your browser
2. **Enter your name** and click "Join Chat"
3. **Send messages** in the general room
4. **Switch rooms** using the room selector
5. **Open multiple tabs** to test real-time messaging

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process or change port in docker-compose.yml
```

### Database Issues

```bash
# Check database logs
docker compose logs mysql

# Reset database
docker compose down -v
docker compose up -d
```

### Application Won't Start

```bash
# Check application logs
docker compose logs app

# Rebuild containers
docker compose up --build -d
```

## 📊 System Requirements

- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Memory**: 512MB RAM
- **Disk**: 1GB free space

## 🎯 Next Steps

After getting the basic setup running:

1. **Customize the UI** in `public/index.html`
2. **Add new chat rooms** in the frontend
3. **Configure AWS Lambda** for message processing
4. **Deploy to production** using the provided Docker setup

## 📞 Support

If you encounter any issues:

1. Check the logs: `docker compose logs`
2. Review the troubleshooting section
3. Create an issue in the repository

---

**Ready to chat? Run `docker compose up -d` and start messaging!** 💬
