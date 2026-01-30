# Wealth Manager PWA

A simple, self-hosted wealth manager web application built with Node.js, React, and SQLite.

## Features

- 🔐 Simple password-based authentication
- 📝 Manual transaction entry (scheme name, type, units, NAV, amount, date)
- 💰 Asset type categorization (Stocks, Mutual Funds, Fixed Deposits)
- 📊 Transaction tracking and management
- 📱 PWA support (installable as mobile app)
- 🐳 Docker & Docker Compose for easy deployment
- 💾 SQLite database for persistent data storage
- 🌐 Self-hosted (no cloud dependencies)

## Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Or: Node.js 18+ and npm

### Using Docker Compose (Recommended)

1. Clone the repository
```bash
git clone <repo-url>
cd wealth-manager
```

2. Start the application
```bash
docker-compose up -d
```

3. Open browser and visit: `http://localhost:3000`

4. Login with password: `admin123`

#### Changing the Password
```bash
docker-compose down
docker-compose up -d -e APP_PASSWORD=your_new_password
```

Or edit `docker-compose.yml` and change the `APP_PASSWORD` variable.

### Local Development

#### Setup Backend
```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

#### Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

The frontend will proxy API requests to the backend.

## Project Structure

```
wealth-manager/
├── backend/                 # Express API server
│   ├── src/
│   │   └── server.js       # Main server file
│   ├── package.json
│   └── Dockerfile
├── frontend/               # React PWA app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── public/
│   │   ├── manifest.json   # PWA manifest
│   │   └── sw.js           # Service worker
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml      # Multi-container orchestration
├── nginx.conf              # Nginx reverse proxy config
└── README.md
```

## API Endpoints

All endpoints require `Authorization: Bearer <password>` header.

### Authentication
- `POST /api/login` - Login with password

### Transactions
- `GET /api/transactions` - Get all transactions (supports ?assetType=filter)
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Asset Types
- `GET /api/asset-types` - Get all asset types

## Transaction Schema

```json
{
  "scheme_name": "Axis Blue Chip Fund",
  "asset_type": "Mutual Funds",
  "transaction_type": "Buy",
  "units": 10.5,
  "nav": 3500.00,
  "amount": 36750.00,
  "date": "2024-01-15"
}
```

## Database

SQLite database is stored at `/app/data/wealth.db` inside the Docker container (persistent volume).

### Tables
- `asset_types` - Asset type definitions
- `transactions` - All transactions with details

## PWA Features

- Installable as mobile app
- Service worker caching (offline support)
- Responsive mobile-first design
- App shortcuts

## Security Notes

- Simple password authentication (plain text in environment)
- Not recommended for multi-user or sensitive production use
- All communication should use HTTPS in production
- Change default password immediately

## Future Enhancements

- [ ] User authentication system
- [ ] Multi-user support
- [ ] Transaction analytics & reports
- [ ] CSV import/export
- [ ] Advanced filtering and search
- [ ] Dark mode
- [ ] Offline data sync
- [ ] Transaction categories

## Troubleshooting

### Port already in use
Change ports in `docker-compose.yml`:
```yaml
ports:
  - "3001:80"      # Change 3001 to desired port
  - "5001:5000"    # Change 5001 to desired port
```

### Database not persisting
Ensure the volume is properly mounted:
```bash
docker volume ls
docker volume inspect wealth-manager_wealth-manager-data
```

### Frontend can't reach backend
Check that backend is running and healthy:
```bash
docker-compose ps
docker-compose logs backend
```

## License

MIT
