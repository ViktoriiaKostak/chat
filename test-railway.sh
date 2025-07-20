#!/bin/bash

echo "🚀 Testing Railway deployment configuration..."

# Check if all required files exist
echo "📁 Checking required files..."
required_files=(
    "public/index.html"
    "src/main.ts"
    "src/app.controller.ts"
    "package.json"
    "railway.json"
    "Dockerfile.railway"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ $file not found"
        exit 1
    fi
done

echo "✅ All required files found"

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Check if dist files exist
echo "📁 Checking build output..."
if [ ! -f "dist/src/main.js" ]; then
    echo "❌ dist/src/main.js not found"
    exit 1
fi

echo "✅ Build output verified"

# Test the application locally
echo "🧪 Testing application locally..."
npm run start:prod &
APP_PID=$!

sleep 5

# Test health check endpoint
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Health check endpoint works"
else
    echo "❌ Health check endpoint failed"
    kill $APP_PID 2>/dev/null
    exit 1
fi

# Test main page
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Main page loads correctly"
else
    echo "❌ Main page failed to load"
    kill $APP_PID 2>/dev/null
    exit 1
fi

# Kill the test process
kill $APP_PID 2>/dev/null

echo "🎉 Railway deployment test completed successfully!"
echo "📋 Ready for Railway deployment!"
echo ""
echo "Next steps:"
echo "1. Commit and push your changes:"
echo "   git add ."
echo "   git commit -m 'Configure Railway deployment with Docker'"
echo "   git push"
echo ""
echo "2. Deploy to Railway:"
echo "   railway up"
echo ""
echo "3. Set environment variables in Railway dashboard:"
echo "   - NODE_ENV=production"
echo "   - DB_HOST=your-database-host"
echo "   - DB_PORT=3306"
echo "   - DB_USERNAME=your-db-username"
echo "   - DB_PASSWORD=your-db-password"
echo "   - DB_DATABASE=chat_app" 