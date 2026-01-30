@echo off
REM Wealth Manager - Quick Start Script (Windows)

echo 🚀 Starting Wealth Manager...
echo.

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose found
echo.

REM Check if already running
docker-compose ps | findstr "wealth-manager-frontend" >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  Services are already running!
    echo.
    echo To stop services: docker-compose down
    echo To restart services: docker-compose restart
    echo To view logs: docker-compose logs -f
    pause
    exit /b 0
)

REM Start services
echo 📦 Building and starting services...
docker-compose up -d

echo.
echo ⏳ Waiting for services to start...
timeout /t 5 /nobreak

REM Check if running
docker-compose ps | findstr "Up" >nul 2>&1
if not errorlevel 1 (
    echo.
    echo ✅ Wealth Manager is running!
    echo.
    echo 📱 Open browser: http://localhost:3000
    echo 🔐 Default password: admin123
    echo.
    echo 📊 API runs on: http://localhost:5000
    echo 💾 Database: /app/data/wealth.db
    echo.
    echo 📋 Useful commands:
    echo    - View logs:      docker-compose logs -f
    echo    - Stop services:  docker-compose down
    echo    - Restart:        docker-compose restart
    echo    - Status:         docker-compose ps
) else (
    echo ❌ Failed to start services. Check logs:
    docker-compose logs
    exit /b 1
)

pause
