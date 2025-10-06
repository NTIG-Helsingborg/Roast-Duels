import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React build
app.use(express.static(path.join(__dirname, '../../dist')));

// Database setup
const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS roasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    points INTEGER NOT NULL,
    username TEXT NOT NULL,
    roast TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Initialize with sample data if empty
const countStmt = db.prepare('SELECT COUNT(*) as count FROM roasts');
const count = countStmt.get().count;

if (count === 0) {
  const insertStmt = db.prepare(`
    INSERT INTO roasts (points, username, roast) 
    VALUES (?, ?, ?)
  `);
  insertStmt.run(95, 'RoastMaster', 'Your code is so bad, even bugs refuse to run it!');
}

// API Routes
app.get('/api/roasts', (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const stmt = db.prepare(`
      SELECT id, points, username, roast, created_at 
      FROM roasts 
      ORDER BY points DESC, created_at ASC 
      LIMIT ?
    `);
    const roasts = stmt.all(limit);
    res.json(roasts);
  } catch (error) {
    console.error('Error fetching roasts:', error);
    res.status(500).json({ error: 'Failed to fetch roasts' });
  }
});

app.post('/api/roasts', (req, res) => {
  try {
    const { points, username, roast } = req.body;
    
    if (!points || !username || !roast) {
      return res.status(400).json({ error: 'Missing required fields: points, username, roast' });
    }

    const stmt = db.prepare(`
      INSERT INTO roasts (points, username, roast) 
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(points, username, roast);
    res.json({ 
      id: result.lastInsertRowid, 
      points, 
      username, 
      roast,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding roast:', error);
    res.status(500).json({ error: 'Failed to add roast' });
  }
});

// Handle React routing - serve index.html for all non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Database initialized with sample data`);
  console.log(`\n📡 Available API endpoints:`);
  console.log(`   GET  /api/roasts - Get all roasts`);
  console.log(`   POST /api/roasts - Add new roast`);
});