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

export type CheckpointRow = {
  id: number;
  name: string;
  created_at: string;
  last_updated: string;
  player_age: number;
  player_data: any;
  time_data: any;
  dungeon_data: any;
  character_data: any;
  shops_data: any;
};
