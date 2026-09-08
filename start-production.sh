#!/bin/bash

# LearnSphere Production Startup Script
# This script starts both Nginx (frontend) and Flask backend

set -e

echo "🚀 Starting LearnSphere Production Environment..."

# Function to check if service is healthy
check_health() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    echo "⏳ Checking $service_name health..."
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null; then
            echo "✅ $service_name is healthy!"
            return 0
        fi
        echo "⏳ Attempt $attempt/$max_attempts: $service_name not ready yet..."
        sleep 2
        ((attempt++))
    done
    
    echo "❌ $service_name failed to become healthy!"
    return 1
}

# Start backend in background
echo "🔧 Starting Flask backend..."
cd /app
python app_simple.py &
BACKEND_PID=$!

# Wait for backend to be healthy
check_health "Backend" "http://localhost:5001/"

# Start Nginx
echo "🌐 Starting Nginx frontend..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Wait for frontend to be healthy
check_health "Frontend" "http://localhost:80/"

# Setup signal handlers for graceful shutdown
cleanup() {
    echo "🛑 Shutting down services..."
    kill -TERM $BACKEND_PID 2>/dev/null || true
    kill -TERM $NGINX_PID 2>/dev/null || true
    wait $BACKEND_PID 2>/dev/null || true
    wait $NGINX_PID 2>/dev/null || true
    echo "✅ All services stopped gracefully"
    exit 0
}

# Register signal handlers
trap cleanup SIGTERM SIGINT

echo "🎉 LearnSphere is running!"
echo "📊 Frontend: http://localhost:80"
echo "🔧 Backend API: http://localhost:5001"
echo "💡 Press Ctrl+C to stop all services"

# Keep script running and wait for services
wait $BACKEND_PID $NGINX_PID
