# Wealth Manager - Deployment & Setup Guide

## Overview

Wealth Manager is a self-hosted, browser-based application for tracking investments across different asset types (Stocks, Mutual Funds, Fixed Deposits). It consists of:

- **Backend**: Node.js/Express REST API with SQLite database
- **Frontend**: React SPA with PWA support
- **Orchestration**: Docker Compose for easy deployment

## System Requirements

### Docker Deployment (Recommended)
- Docker Engine 20.10+
- Docker Compose 1.29+
- ~500MB disk space (initial)

### Local Development
- Node.js 18+ and npm
- Git
- ~2GB disk space

## Installation

### Option 1: Docker Compose (Production Ready)

**Step 1**: Clone the repository
```bash
git clone <repo-url> wealth-manager
cd wealth-manager
```

**Step 2**: Start the services
```bash
docker-compose up -d
```

**Step 3**: Access the application
- Open browser: `http://localhost:3000`
- Login with password: `admin123`

**Step 4**: Verify deployment
```bash
# Check services are running
docker-compose ps

# View logs
docker-compose logs -f
```

### Option 2: Local Development

**Step 1**: Clone and navigate
```bash
git clone <repo-url> wealth-manager
cd wealth-manager
```

**Step 2**: Install dependencies
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

**Step 3**: Start services

Terminal 1 - Backend:
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

**Step 4**: Access application
- Open browser: `http://localhost:5173`
- Login with password: `admin123`

## Configuration

### Environment Variables

**Backend** (`.env` or docker-compose.yml)
```
APP_PASSWORD=admin123          # Login password
DB_PATH=/app/data/wealth.db    # SQLite database path
NODE_ENV=production             # Environment
PORT=5000                       # Backend port
```

**Frontend** (`.env.local`)
```
VITE_API_URL=http://localhost:5000  # Backend API endpoint
```

### Changing Password

#### Docker Compose
```bash
docker-compose down

# Edit docker-compose.yml:
# Change APP_PASSWORD in backend environment

docker-compose up -d
```

#### Development
Set environment variable before starting:
```bash
# Windows PowerShell
$env:APP_PASSWORD="newpassword123"
npm run dev:backend

# Linux/Mac
export APP_PASSWORD="newpassword123"
npm run dev:backend
```

## Usage

### Adding Transactions

1. Click "Add Transaction" button
2. Fill in the form:
   - **Scheme Name**: Name of the investment (e.g., "Axis Blue Chip Fund")
   - **Asset Type**: Choose from Stocks, Mutual Funds, or Fixed Deposits
   - **Transaction Type**: Buy, Sell, or Dividend
   - **Units**: Number of units/shares
   - **NAV**: Price per unit at transaction time
   - **Amount**: Total transaction amount (Units × NAV)
   - **Date**: Transaction date
3. Click "Add Transaction"

### Managing Transactions

- **View**: All transactions shown in table, sorted by date (newest first)
- **Filter**: Use asset type dropdown to filter transactions
- **Edit**: Click "Edit" to modify transaction details
- **Delete**: Click "Delete" to remove transaction

### PWA Features

**Install as App**:
1. Click the install prompt (browser-dependent)
2. Or use browser menu: "Install app" / "Add to Home Screen"
3. App works offline (cached content)
4. Push notifications (future feature)

## Database

SQLite database location:
```
Docker:       /app/data/wealth.db (persistent volume)
Development:  ./wealth.db (root directory)
```

### Database Backup

```bash
# Docker
docker cp wealth-manager-backend:/app/data/wealth.db ./wealth.db.backup

# Local
cp wealth.db wealth.db.backup
```

### Database Reset

```bash
# Docker - Delete volume to reset
docker-compose down
docker volume rm wealth-manager_wealth-manager-data
docker-compose up -d

# Local - Delete file
rm wealth.db
```

## API Reference

All endpoints require authentication via `Authorization: Bearer <password>` header.

### Authentication
```
POST /api/login
Body: { "password": "admin123" }
Response: { "success": true, "token": "admin123" }
```

### Transactions

#### List Transactions
```
GET /api/transactions?assetType=Mutual%20Funds
Authorization: Bearer admin123
Response: Array of transaction objects
```

#### Create Transaction
```
POST /api/transactions
Authorization: Bearer admin123
Body: {
  "scheme_name": "Axis Blue Chip Fund",
  "asset_type": "Mutual Funds",
  "transaction_type": "Buy",
  "units": 10.5,
  "nav": 3500.00,
  "amount": 36750.00,
  "date": "2024-01-15"
}
```

#### Update Transaction
```
PUT /api/transactions/:id
Authorization: Bearer admin123
Body: [same as create]
```

#### Delete Transaction
```
DELETE /api/transactions/:id
Authorization: Bearer admin123
```

### Asset Types
```
GET /api/asset-types
Authorization: Bearer admin123
Response: [
  { "id": 1, "name": "Stocks" },
  { "id": 2, "name": "Mutual Funds" },
  { "id": 3, "name": "Fixed Deposits" }
]
```

### Health Check
```
GET /api/health
Response: { "status": "ok" }
```

## Troubleshooting

### Issue: Port already in use
**Solution**: Change ports in docker-compose.yml
```yaml
services:
  frontend:
    ports:
      - "3001:80"    # Change 3001 to available port
  backend:
    ports:
      - "5001:5000"  # Change 5001 to available port
```

### Issue: Frontend can't reach backend
**Solution**: Check backend is healthy
```bash
docker-compose ps
docker-compose logs backend
```

### Issue: Database not persisting
**Solution**: Verify volume configuration
```bash
docker volume ls
docker volume inspect wealth-manager_wealth-manager-data
docker exec wealth-manager-backend ls -la /app/data/
```

### Issue: Can't login
**Solution**: Verify password matches APP_PASSWORD environment variable
```bash
docker-compose down
# Check docker-compose.yml for APP_PASSWORD value
docker-compose up -d
```

### Issue: Frontend not loading
**Solution**: Check nginx logs
```bash
docker logs wealth-manager-frontend
# or
curl -i http://localhost:3000/
```

### Issue: Container won't start
**Solution**: Check service logs
```bash
docker-compose logs -f [service-name]
# Examples:
docker-compose logs -f frontend
docker-compose logs -f backend
```

## Performance Optimization

### For Production
1. **Enable HTTPS**: Use reverse proxy (Nginx/Caddy) with SSL
2. **Database Backup**: Regular automatic backups of SQLite file
3. **Resource Limits**: Set limits in docker-compose.yml
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             memory: 512M
   ```
4. **Database Maintenance**: Regular VACUUM to optimize SQLite

### Frontend Optimization
- Service worker caches static assets
- Gzip compression enabled in Nginx
- CSS/JS minified in production build
- Image optimization (use WebP where possible)

## Security Considerations

**⚠️ Current Limitations**:
- Simple password authentication (not recommended for sensitive data)
- No user authentication system
- No HTTPS (must add reverse proxy)
- Plain text password in environment variables

**Recommendations for Production**:
1. Use behind reverse proxy with HTTPS
2. Implement proper user authentication system
3. Use secure password management (AWS Secrets, HashiCorp Vault)
4. Regular security audits
5. Keep dependencies updated: `npm audit fix`
6. Enable audit logging for transaction changes

## Backup & Recovery

### Automated Backup Script
```bash
#!/bin/bash
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

docker cp wealth-manager-backend:/app/data/wealth.db \
  $BACKUP_DIR/wealth_$TIMESTAMP.db

echo "Backup completed: $BACKUP_DIR/wealth_$TIMESTAMP.db"
```

### Manual Restore
```bash
# Stop services
docker-compose down

# Restore database
docker cp wealth.db.backup wealth-manager-backend:/app/data/wealth.db

# Restart
docker-compose up -d
```

## Updates & Maintenance

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verify health
docker-compose ps
```

### Update Dependencies
```bash
# Local development
npm update

# Docker (will auto-update in rebuild)
docker-compose build --no-cache
```

## Support & Contributing

For issues, feature requests, or contributions:
1. Check existing issues in repository
2. Create detailed bug reports with logs
3. Submit pull requests for enhancements

## License

MIT License - See LICENSE file for details

## Roadmap

- [ ] User authentication (OAuth, JWT)
- [ ] Multi-user support
- [ ] Transaction analytics & reports
- [ ] CSV/Excel import & export
- [ ] Advanced filtering & search
- [ ] Dark mode
- [ ] Offline data sync
- [ ] Mobile app (React Native)
- [ ] Transaction categories
- [ ] Portfolio analysis
