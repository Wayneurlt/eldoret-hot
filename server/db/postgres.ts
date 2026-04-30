import { Pool } from 'pg'

let pool: Pool | null = null

export function getPgPool() {
  if (!pool) {
    const config = useRuntimeConfig()
    if (!config.databaseUrl) {
      throw createError({
        statusCode: 500,
        message: 'DATABASE_URL is missing. Set it in .env',
      })
    }
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: { rejectUnauthorized: false },
    })
  }
  return pool
}

export async function ensurePostgresSchema() {
  const db = getPgPool()

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client',
      avatar TEXT,
      phone TEXT,
      location TEXT,
      bio TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS model_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category TEXT NOT NULL DEFAULT 'Fashion',
      subcategory TEXT,
      rates TEXT,
      availability TEXT NOT NULL DEFAULT 'available',
      instagram TEXT,
      twitter TEXT,
      tiktok TEXT,
      portfolio_images JSONB NOT NULL DEFAULT '[]'::jsonb,
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      rating REAL NOT NULL DEFAULT 0,
      total_reviews INTEGER NOT NULL DEFAULT 0,
      verified BOOLEAN NOT NULL DEFAULT FALSE,
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS meetup_requests (
      id SERIAL PRIMARY KEY,
      client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      model_id INTEGER NOT NULL REFERENCES model_profiles(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      project_type TEXT NOT NULL,
      budget TEXT,
      preferred_date TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      response_message TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      model_id INTEGER NOT NULL REFERENCES model_profiles(id) ON DELETE CASCADE,
      meetup_id INTEGER,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      meetup_id INTEGER NOT NULL REFERENCES meetup_requests(id) ON DELETE CASCADE,
      sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_model_profiles_user_id ON model_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_meetup_requests_client_id ON meetup_requests(client_id);
    CREATE INDEX IF NOT EXISTS idx_meetup_requests_model_id ON meetup_requests(model_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_meetup_id ON chat_messages(meetup_id);
  `)

}
