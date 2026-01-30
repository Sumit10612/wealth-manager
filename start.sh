#!/bin/bash

# Wealth Manager - Quick Start Script

set -e

echo "🚀 Starting Wealth Manager..."
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose found"
echo ""

# Check if already running
if docker-compose ps | grep -q wealth-manager-frontend; then
    echo "⚠️  Services are already running!"
    echo ""
    echo "To stop services: docker-compose down"
    echo "To restart services: docker-compose restart"
    echo "To view logs: docker-compose logs -f"
    exit 0
fi

# Start services
echo "📦 Building and starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Check if running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ Wealth Manager is running!"
    echo ""
    echo "📱 Open browser: http://localhost:3000"
    echo "🔐 Default password: admin123"
    echo ""
    echo "📊 API runs on: http://localhost:5000"
    echo "💾 Database: /app/data/wealth.db"
    echo ""
    echo "📋 Useful commands:"
    echo "   - View logs:      docker-compose logs -f"
    echo "   - Stop services:  docker-compose down"
    echo "   - Restart:        docker-compose restart"
    echo "   - Status:         docker-compose ps"
else
    echo "❌ Failed to start services. Check logs:"
    docker-compose logs
    exit 1
fi
