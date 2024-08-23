import { createClient } from "@libsql/client/.";

// Turso
export function RemoteConnectionFactory() {
  const db_url = process.env.TURSO_DB_URL;
  const db_token = process.env.TURSO_DB_URL;
  if (db_url && db_token) {
    const config = {
      url: db_url,
      authToken: db_token,
    };

    const conn = createClient(config);
    return conn;
  } else {
    throw new Error("missing env for turso");
  }
}

const conductor = `
  CREATE TABLE User_new
  (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    email_verified INTEGER DEFAULT 0, 
    password_hash TEXT,
    provider TEXT,
    image TEXT,
    database_url TEXT, 
    database_token TEXT,
    registered_at TEXT NOT NULL DEFAULT (datetime('now')),
    db_destroy_date TEXT DEFAULT (datetime('now', '+1 year'))
  );
`;
