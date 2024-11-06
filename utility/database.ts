const conductor = `
  CREATE TABLE User
  (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    email_verified INTEGER DEFAULT 0, 
    password_hash TEXT,
    apple_user_string TEXT,
    provider TEXT,
    database_name TEXT, 
    database_token TEXT,
    registered_at TEXT NOT NULL DEFAULT (datetime('now')),
    db_destroy_date TEXT DEFAULT (datetime('now', '+1 year'))
  );
`;
const user_db = `
  CREATE TABLE Save
  (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    game_state TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

const token_table = `
  CREATE TABLE Token
  (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE,
    last_updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

export type SaveRow = {
  id: number;
  name: string;
  game_state: string;
  player_state: string;
  created_at: string;
  last_updated_at: string;
};
