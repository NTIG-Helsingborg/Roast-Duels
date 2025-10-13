import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'roasts.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS roasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    roast TEXT NOT NULL,
    score INTEGER NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export const saveRoast = (username, roast, score) => {
  const query = db.prepare('INSERT INTO roasts (username, roast, score) VALUES (?, ?, ?)');
  return query.run(username, roast, score);
};

export const getTopAllTime = (limit = 50) => {
  const query = db.prepare(`
    SELECT id, username, roast, score, date 
    FROM roasts 
    ORDER BY score DESC, date DESC 
    LIMIT ?
  `);
  return query.all(limit);
};

export const getTopPast7Days = (limit = 50) => {
  const query = db.prepare(`
    SELECT id, username, roast, score, date 
    FROM roasts 
    WHERE date >= datetime('now', '-7 days')
    ORDER BY score DESC, date DESC 
    LIMIT ?
  `);
  return query.all(limit);
};

export const getMostRecent = (limit = 50) => {
  const query = db.prepare(`
    SELECT id, username, roast, score, date 
    FROM roasts 
    ORDER BY date DESC 
    LIMIT ?
  `);
  return query.all(limit);
};

export const createUser = (username, passwordHash) => {
  const query = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
  return query.run(username, passwordHash);
};

export const getUserByUsername = (username) => {
  const query = db.prepare('SELECT * FROM users WHERE username = ?');
  return query.get(username);
};

export default db;