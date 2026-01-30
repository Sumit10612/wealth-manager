# Wealth Manager - Project Overview

## What's Included

Your wealth manager PWA application is a complete, production-ready system for tracking investments with the following components:

### Backend (Node.js/Express)
- **Location**: `/backend`
- **Features**:
  - RESTful API for transaction management
  - SQLite database integration
  - Password-based authentication
  - Auto-creating database schema
  - CORS-enabled for frontend access
  - Health check endpoint

### Frontend (React/Vite)
- **Location**: `/frontend`
- **Features**:
  - Modern React SPA with hooks
  - Tailwind CSS for responsive design
  - Service worker for PWA functionality
  - Login/authentication flow
  - Transaction form with validation
  - Transaction list with filtering
  - Edit/Delete functionality
  - Mobile-optimized UI

### Docker & Deployment
- **Multi-container setup** with Docker Compose
- **Nginx reverse proxy** for frontend
- **Persistent data volume** for SQLite database
- **Health checks** for service monitoring

## File Structure

```
wealth-manager/
├── backend/
│   ├── src/
│   │   └── server.js              # Express API server
│   ├── package.json               # Backend dependencies
│   ├── Dockerfile                 # Backend container
│   └── .env.example               # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginPage.jsx      # Authentication UI
│   │   │   ├── TransactionManager.jsx  # Main app container
│   │   │   ├── TransactionForm.jsx     # Add/Edit form
│   │   │   └── TransactionList.jsx     # Table view
│   │   ├── main.jsx               # App entry point
│   │   ├── App.jsx                # Root component
│   │   ├── index.css              # Tailwind imports
│   │   └── App.css                # App-specific styles
│   │
│   ├── public/
│   │   ├── manifest.json          # PWA manifest
│   │   └── sw.js                  # Service worker
│   │
│   ├── index.html                 # HTML template
│   ├── vite.config.js             # Vite configuration
│   ├── tailwind.config.js          # Tailwind configuration
│   ├── postcss.config.js          # PostCSS configuration
│   ├── package.json               # Frontend dependencies
│   ├── Dockerfile                 # Frontend container
│   └── .env.example               # Environment template
│
├── docker-compose.yml             # Multi-container orchestration
├── nginx.conf                     # Nginx configuration
├── package.json                   # Root scripts
├── README.md                      # Quick start guide
├── DEPLOYMENT.md                  # Detailed deployment guide
├── start.sh                       # Linux/Mac startup script
├── start.bat                      # Windows startup script
├── .dockerignore                  # Docker build ignores
└── .gitignore                     # Git ignores
```

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Backend** | Node.js | 20 | Runtime |
| | Express | 4.18 | REST API framework |
| | SQLite3 | 5.1 | Database |
| | CORS | 2.8 | Cross-origin support |
| **Frontend** | React | 18.2 | UI library |
| | Vite | 5.0 | Build tool |
| | Tailwind CSS | 3.3 | Styling |
| | PostCSS | 8.4 | CSS processing |
| **Deployment** | Docker | Latest | Containerization |
| | Docker Compose | Latest | Orchestration |
| | Nginx | Alpine | Reverse proxy |

## Key Features

### ✅ Implemented
- User authentication with password protection
- Add/Edit/Delete transactions
- Asset type categorization (Stocks, Mutual Funds, FDs)
- Transaction type management (Buy, Sell, Dividend)
- Data persistence in SQLite
- Responsive mobile-first UI
- Service worker for PWA caching
- Installable as mobile app
- Docker-based deployment
- Nginx reverse proxy
- API health checks

### 🔄 Transaction Data Captured
- **Scheme Name**: Investment name
- **Asset Type**: Category (Stocks/Mutual Funds/Fixed Deposits)
- **Transaction Type**: Buy/Sell/Dividend
- **Units**: Number of units/shares
- **NAV**: Net Asset Value (price per unit)
- **Amount**: Total transaction amount
- **Date**: Transaction date
- **Timestamps**: Auto-tracked creation/update times

### 🚀 Future Enhancements (Ready to Add)
- User authentication system
- Multi-user support
- Transaction analytics & reports
- CSV/Excel import & export
- Advanced filtering & search
- Dark mode
- Offline-first data sync
- Portfolio analysis & insights
- Transaction categories
- Dividend tracking
- Tax report generation

## Database Schema

### asset_types
```sql
CREATE TABLE asset_types (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### transactions
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  scheme_name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  units REAL NOT NULL,
  nav REAL NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_type) REFERENCES asset_types(name)
)
```

## API Endpoints Summary

```
Authentication:
  POST /api/login

Transactions:
  GET    /api/transactions
  GET    /api/transactions/:id
  POST   /api/transactions
  PUT    /api/transactions/:id
  DELETE /api/transactions/:id

Asset Types:
  GET    /api/asset-types

Health:
  GET    /api/health
```

All endpoints require `Authorization: Bearer <password>` header.

## Getting Started (Quick Reference)

### Docker (Recommended)
```bash
docker-compose up -d
# Open http://localhost:3000
# Login: admin123
```

### Local Development
```bash
# Terminal 1 - Backend
cd backend && npm install && npm run dev

# Terminal 2 - Frontend
cd frontend && npm install && npm run dev
```

## Configuration

### Change Password
Edit `docker-compose.yml`:
```yaml
backend:
  environment:
    - APP_PASSWORD=your_new_password
```

### Change Ports
Edit `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "3001:80"    # Change 3001 to your port

backend:
  ports:
    - "5001:5000"  # Change 5001 to your port
```

### Change API URL (Frontend)
Edit `frontend/.env.local`:
```
VITE_API_URL=http://your-backend-url:5000
```

## Important Notes

1. **Password Security**: Currently uses plain text password. Not recommended for sensitive production data. Use HTTPS in production.

2. **Database Backup**: SQLite database is stored in a Docker volume. Backup regularly:
   ```bash
   docker cp wealth-manager-backend:/app/data/wealth.db ./backup.db
   ```

3. **HTTPS**: For production, deploy behind a reverse proxy with SSL/TLS (e.g., Caddy, Traefik).

4. **Scaling**: Current setup is single-instance. For multi-instance, migrate to PostgreSQL/MySQL.

## Development Workflow

### Making Changes

1. **Backend Changes**:
   - Edit files in `backend/src/`
   - Server auto-reloads with `npm run dev`
   - API available at `http://localhost:5000`

2. **Frontend Changes**:
   - Edit files in `frontend/src/`
   - Hot reload in browser with `npm run dev`
   - App available at `http://localhost:5173`

3. **Build for Production**:
   ```bash
   npm run build
   docker-compose build
   docker-compose up -d
   ```

### Testing
1. Open app at `http://localhost:3000` (Docker) or `http://localhost:5173` (Dev)
2. Login with configured password
3. Test adding/editing/deleting transactions
4. Test filtering by asset type
5. Test PWA install on mobile browser

## Troubleshooting Quick Links

- Port conflicts → See DEPLOYMENT.md "Port already in use"
- Database issues → See DEPLOYMENT.md "Database not persisting"
- Can't login → See DEPLOYMENT.md "Can't login"
- Frontend not loading → See DEPLOYMENT.md "Frontend not loading"

## Next Steps

1. **Test the Application**:
   - Start with Docker Compose
   - Add some test transactions
   - Verify functionality

2. **Customize**:
   - Change password in docker-compose.yml
   - Update asset types in database if needed
   - Adjust styling in Tailwind config

3. **Deploy**:
   - Use provided docker-compose.yml
   - Add HTTPS reverse proxy
   - Set up automated backups
   - Monitor with health checks

4. **Extend**:
   - Add new features from roadmap
   - Connect to external APIs
   - Add advanced analytics
   - Implement user authentication

## Support Resources

- **README.md** - Quick start guide
- **DEPLOYMENT.md** - Detailed deployment instructions
- **Backend Code** - Well-commented server.js
- **Frontend Components** - Modular React components
- **Docker Logs** - `docker-compose logs -f [service]`

---

**Your wealth manager is ready to deploy! 🎉**

Start with: `docker-compose up -d`
