#!/bin/bash

echo "🧪 Testing different deployment options..."

test_dockerfile() {
    local dockerfile=$1
    local name=$2
    
    echo "📦 Testing $name..."
    
    docker compose down 2>/dev/null
    
    sed -i.bak "s/dockerfile:.*/dockerfile: $dockerfile/" docker-compose.yml
    
    if docker compose build --no-cache; then
        echo "✅ $name build successful"
        
        if docker compose up -d; then
            echo "✅ $name deployment successful"
            echo "🌐 App should be available at: http://localhost:3000"
            echo "🔍 Health check: http://localhost:3000/health"
            
            sleep 10
            
            if curl -f http://localhost:3000/health >/dev/null 2>&1; then
                echo "✅ Health check passed"
            else
                echo "❌ Health check failed"
            fi
            
            echo "📋 Recent logs:"
            docker compose logs --tail=10 app
            
        else
            echo "❌ $name deployment failed"
        fi
    else
        echo "❌ $name build failed"
    fi
    
    echo ""
}

echo "🚀 Starting deployment tests..."
echo ""

cp docker-compose.yml docker-compose.yml.backup

test_dockerfile "Dockerfile.multi" "Multi-stage Dockerfile"

test_dockerfile "Dockerfile.simple" "Simple Dockerfile"

test_dockerfile "Dockerfile" "Original Dockerfile"

mv docker-compose.yml.backup docker-compose.yml

echo "🎯 Deployment tests completed!"
echo ""
echo "📋 Summary:"
echo "  - Multi-stage: $(docker images | grep -q chat_app && echo "✅" || echo "❌")"
echo "  - Simple: $(docker images | grep -q chat_app && echo "✅" || echo "❌")"
echo "  - Original: $(docker images | grep -q chat_app && echo "✅" || echo "❌")"

echo ""
echo "🔧 To use a specific Dockerfile, edit docker-compose.yml:"
echo "   dockerfile: Dockerfile.multi  # or Dockerfile.simple" 