import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'roasts.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS roasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    roast TEXT NOT NULL,
    score INTEGER NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

export const saveRoast = (userId, roast, score) => {
  const query = db.prepare('INSERT INTO roasts (user_id, roast, score) VALUES (?, ?, ?)');
  return query.run(userId, roast, score);
};

export const getTopAllTime = (limit = 50) => {
  const query = db.prepare(`
    SELECT r.id, u.username, r.roast, r.score, r.date 
    FROM roasts r
    JOIN users u ON r.user_id = u.id
    ORDER BY r.score DESC, r.date DESC 
    LIMIT ?
  `);
  return query.all(limit);
};

export const getTopPast7Days = (limit = 50) => {
  const query = db.prepare(`
    SELECT r.id, u.username, r.roast, r.score, r.date 
    FROM roasts r
    JOIN users u ON r.user_id = u.id
    WHERE r.date >= datetime('now', '-7 days')
    ORDER BY r.score DESC, r.date DESC 
    LIMIT ?
  `);
  return query.all(limit);
};

export const getMostRecent = (limit = 50) => {
  const query = db.prepare(`
    SELECT r.id, u.username, r.roast, r.score, r.date 
    FROM roasts r
    JOIN users u ON r.user_id = u.id
    ORDER BY r.date DESC 
    LIMIT ?
  `);
  return query.all(limit);
};

export const searchRoasts = (searchQuery, limit = 50) => {
  const query = db.prepare(`
    SELECT r.id, u.username, r.roast, r.score, r.date 
    FROM roasts r
    JOIN users u ON r.user_id = u.id
    WHERE u.username LIKE ? OR r.roast LIKE ?
    ORDER BY r.score DESC, r.date DESC 
    LIMIT ?
  `);
  const searchPattern = `%${searchQuery}%`;
  return query.all(searchPattern, searchPattern, limit);
};

export const createUser = (username, passwordHash) => {
  const query = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
  return query.run(username, passwordHash);
};

export const getUserByUsername = (username) => {
  const query = db.prepare('SELECT * FROM users WHERE username = ?');
  return query.get(username);
};

export const getUserById = (userId) => {
  const query = db.prepare('SELECT * FROM users WHERE id = ?');
  return query.get(userId);
};

export const updateUsername = (userId, newUsername) => {
  const query = db.prepare('UPDATE users SET username = ? WHERE id = ?');
  return query.run(newUsername, userId);
};

export const checkDuplicateRoast = (roastText) => {
  const exactQuery = db.prepare('SELECT id FROM roasts WHERE LOWER(roast) = LOWER(?)');
  const exactMatch = exactQuery.get(roastText);
  if (exactMatch) {
    return { isDuplicate: true, type: 'exact' };
  }

  const normalizedRoast = roastText.toLowerCase().trim();
  const similarQuery = db.prepare(`
    SELECT id, roast FROM roasts 
    WHERE LOWER(TRIM(roast)) = ?
  `);
  const similarMatch = similarQuery.get(normalizedRoast);
  if (similarMatch) {
    return { isDuplicate: true, type: 'similar', existingRoast: similarMatch.roast };
  }

  const allRoastsQuery = db.prepare('SELECT id, roast FROM roasts ORDER BY date DESC LIMIT 1000');
  const allRoasts = allRoastsQuery.all();
  
  for (const existingRoast of allRoasts) {
    const similarity = calculateSimilarity(normalizedRoast, existingRoast.roast.toLowerCase().trim());
    if (similarity >= 0.9) {
      return { isDuplicate: true, type: 'similarity', existingRoast: existingRoast.roast, similarity };
    }
  }

  return { isDuplicate: false };
};

const calculateSimilarity = (str1, str2) => {
  if (str1 === str2) return 1.0;
  
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0 || len2 === 0) return 0.0;
  
  const longer = len1 > len2 ? str1 : str2;
  const shorter = len1 > len2 ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

export default db;