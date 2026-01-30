import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;
const PASSWORD = process.env.APP_PASSWORD || 'admin123';

// Middleware
app.use(cors());
app.use(express.json());

// SQLite database setup
const dbPath = process.env.DB_PATH || '/app/data/wealth.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database at', dbPath);
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Asset types table
    db.run(`
      CREATE TABLE IF NOT EXISTS asset_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Platforms table
    db.run(`
      CREATE TABLE IF NOT EXISTS platforms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Accounts table
    db.run(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Transactions table
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scheme_name TEXT NOT NULL,
        asset_type TEXT NOT NULL,
        transaction_type TEXT NOT NULL,
        units REAL NOT NULL,
        nav REAL NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        platform TEXT,
        account TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (asset_type) REFERENCES asset_types(name)
      )
    `);

    // Add platform and account columns if they don't exist (migration)
    db.all(`PRAGMA table_info(transactions)`, (err, columns) => {
      if (!err && columns) {
        const hasPlatform = columns.some(col => col.name === 'platform');
        const hasAccount = columns.some(col => col.name === 'account');
        
        if (!hasPlatform) {
          db.run(`ALTER TABLE transactions ADD COLUMN platform TEXT`, (err) => {
            if (err) console.log('Platform column already exists or error:', err.message);
            else console.log('Added platform column to transactions table');
          });
        }
        
        if (!hasAccount) {
          db.run(`ALTER TABLE transactions ADD COLUMN account TEXT`, (err) => {
            if (err) console.log('Account column already exists or error:', err.message);
            else console.log('Added account column to transactions table');
          });
        }
      }
    });

    // Seed asset types if not exists
    db.all(`SELECT COUNT(*) as count FROM asset_types`, (err, rows) => {
      if (rows[0].count === 0) {
        const assetTypes = ['Stocks', 'Mutual Funds', 'Fixed Deposits'];
        assetTypes.forEach(type => {
          db.run(`INSERT INTO asset_types (name) VALUES (?)`, [type]);
        });
      }
    });
  });
}

// Authentication middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token !== PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Routes

// Login endpoint
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === PASSWORD) {
    res.json({ success: true, token: PASSWORD });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Get all asset types
app.get('/api/asset-types', authenticate, (req, res) => {
  db.all(`SELECT * FROM asset_types ORDER BY name`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Add asset type
app.post('/api/asset-types', authenticate, (req, res) => {
  const { name } = req.body;
  db.run(`INSERT INTO asset_types (name) VALUES (?)`, [name], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, name });
  });
});

// Delete asset type
app.delete('/api/asset-types/:id', authenticate, (req, res) => {
  db.run(`DELETE FROM asset_types WHERE id = ?`, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Get all platforms
app.get('/api/platforms', authenticate, (req, res) => {
  db.all(`SELECT * FROM platforms ORDER BY name`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Add platform
app.post('/api/platforms', authenticate, (req, res) => {
  const { name } = req.body;
  db.run(`INSERT INTO platforms (name) VALUES (?)`, [name], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, name });
  });
});

// Delete platform
app.delete('/api/platforms/:id', authenticate, (req, res) => {
  db.run(`DELETE FROM platforms WHERE id = ?`, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Get all accounts
app.get('/api/accounts', authenticate, (req, res) => {
  db.all(`SELECT * FROM accounts ORDER BY name`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Add account
app.post('/api/accounts', authenticate, (req, res) => {
  const { name } = req.body;
  db.run(`INSERT INTO accounts (name) VALUES (?)`, [name], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, name });
  });
});

// Delete account
app.delete('/api/accounts/:id', authenticate, (req, res) => {
  db.run(`DELETE FROM accounts WHERE id = ?`, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Get all transactions
app.get('/api/transactions', authenticate, (req, res) => {
  const { assetType, platform, account } = req.query;
  let query = `SELECT * FROM transactions`;
  let params = [];
  let conditions = [];

  if (assetType) {
    conditions.push(`asset_type = ?`);
    params.push(assetType);
  }

  if (platform) {
    conditions.push(`platform = ?`);
    params.push(platform);
  }

  if (account) {
    conditions.push(`account = ?`);
    params.push(account);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(' AND ');
  }

  query += ` ORDER BY created_at DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get single transaction
app.get('/api/transactions/:id', authenticate, (req, res) => {
  db.get(`SELECT * FROM transactions WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(row);
  });
});

// Create transaction
app.post('/api/transactions', authenticate, (req, res) => {
  const { scheme_name, asset_type, transaction_type, units, nav, amount, date, platform, account } = req.body;

  if (!scheme_name || !asset_type || !transaction_type || units === undefined || nav === undefined || amount === undefined || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `INSERT INTO transactions (scheme_name, asset_type, transaction_type, units, nav, amount, date, platform, account)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [scheme_name, asset_type, transaction_type, units, nav, amount, date, platform || null, account || null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: 'Transaction created' });
    }
  );
});

// Update transaction
app.put('/api/transactions/:id', authenticate, (req, res) => {
  const { scheme_name, asset_type, transaction_type, units, nav, amount, date, platform, account } = req.body;

  db.run(
    `UPDATE transactions SET scheme_name = ?, asset_type = ?, transaction_type = ?, units = ?, nav = ?, amount = ?, date = ?, platform = ?, account = ?
     WHERE id = ?`,
    [scheme_name, asset_type, transaction_type, units, nav, amount, date, platform || null, account || null, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.json({ message: 'Transaction updated' });
    }
  );
});

// Delete transaction
app.delete('/api/transactions/:id', authenticate, (req, res) => {
  db.run(`DELETE FROM transactions WHERE id = ?`, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted' });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
