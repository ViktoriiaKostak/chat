# Deployment Troubleshooting

## Problem: "npm run build" doesn't complete successfully

### Solution 1: Using multi-stage Dockerfile

If the main Dockerfile doesn't work, use `Dockerfile.multi`:

```bash
# В docker-compose.yml змініть:
dockerfile: Dockerfile.multi
target: production
```

### Solution 2: Using simplified Dockerfile

If there are issues with NestJS CLI, use `Dockerfile.simple`:

```bash
# В docker-compose.yml змініть:
dockerfile: Dockerfile.simple
```

### Solution 3: Local build

```bash
# Build locally
npm install
npm run build

# Check if dist/src/main.js was created
ls -la dist/src/
```

## Problem: Missing environment variables

### Solution:

1. **Create .env file**:
```bash
cp env.example .env
```

2. **Configure variables for cloud provider**:
```env
NODE_ENV=production
PORT=3000
DATABASE_HOST=your-mysql-host
DATABASE_PORT=3306
DATABASE_USERNAME=your-mysql-username
DATABASE_PASSWORD=your-mysql-password
DATABASE_NAME=your-mysql-database
```

## Problem: Database doesn't connect

### Solution:

1. **Check environment variables**
2. **Make sure database is running**
3. **Check network settings**

## Problem: Port is occupied

### Solution:

```bash
# Check what's using port 3000
lsof -i :3000

# Stop the process or change port in docker-compose.yml
```

## Problem: Docker can't build image

### Solution:

```bash
# Clear Docker cache
docker system prune -a

# Rebuild image
docker compose build --no-cache

# Or use simplified Dockerfile
docker build -f Dockerfile.simple -t chat-app .
```

## Problem: AWS Lambda doesn't work

### Solution:

AWS Lambda is optional. The application will work without it. Just don't configure AWS environment variables.

## Useful debug commands

```bash
# View logs
docker compose logs -f app

# View database logs
docker compose logs -f mysql

# Enter container
docker compose exec app sh

# Check environment variables in container
docker compose exec app env

# Restart services
docker compose restart
``` 