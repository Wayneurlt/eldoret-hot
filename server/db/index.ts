import Database from 'better-sqlite3'
import { join } from 'path'

let db: ReturnType<typeof Database> | null = null

export function getDb() {
  if (!db) {
    const config = useRuntimeConfig()
    const dbPath = config.dbPath || './eldoret-hot.db'
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    initializeSchema(db)
  }
  return db
}

function initializeSchema(db: ReturnType<typeof Database>) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client' CHECK(role IN ('model', 'client', 'admin')),
      avatar TEXT,
      phone TEXT,
      location TEXT,
      bio TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS model_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      category TEXT NOT NULL DEFAULT 'Fashion',
      subcategory TEXT,
      rates TEXT,
      availability TEXT NOT NULL DEFAULT 'available' CHECK(availability IN ('available', 'busy', 'unavailable')),
      instagram TEXT,
      twitter TEXT,
      tiktok TEXT,
      portfolio_images TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      rating REAL DEFAULT 0,
      total_reviews INTEGER DEFAULT 0,
      verified INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS meetup_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      model_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      project_type TEXT NOT NULL,
      budget TEXT,
      preferred_date TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'completed')),
      response_message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (model_id) REFERENCES model_profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reviewer_id INTEGER NOT NULL,
      model_id INTEGER NOT NULL,
      meetup_id INTEGER,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (model_id) REFERENCES model_profiles(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_model_profiles_user_id ON model_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_meetup_requests_client_id ON meetup_requests(client_id);
    CREATE INDEX IF NOT EXISTS idx_meetup_requests_model_id ON meetup_requests(model_id);
  `)
}
