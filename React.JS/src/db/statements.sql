CREATE TABLE roasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    points INTEGER NOT NULL,
    username TEXT NOT NULL,
    roast TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_points_desc ON roasts(points DESC);

CREATE INDEX IF NOT EXISTS idx_username ON roasts(username);

CREATE INDEX IF NOT EXISTS idx_created_at ON roasts(created_at);

INSERT INTO roasts (points, username, roast) VALUES (95, 'RoastMaster', 'Your code is so bad, even bugs refuse to run it!');