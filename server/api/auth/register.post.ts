import bcrypt from 'bcryptjs'
import { getDb } from '~/server/db'
import { ensurePostgresSchema, getPgPool } from '~/server/db/postgres'
import { signToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password, name, role, phone, location } = body

  if (!email || !password || !name || !role) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  if (!['model', 'client'].includes(role)) {
    throw createError({ statusCode: 400, message: 'Invalid role' })
  }

  if (password.length < 6) {
    throw createError({ statusCode: 400, message: 'Password must be at least 6 characters' })
  }

  const config = useRuntimeConfig()
  const hashedPassword = await bcrypt.hash(password, 10)
  let user: any

  if (config.databaseUrl) {
    await ensurePostgresSchema()
    const db = getPgPool()

    const existing = await db.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [email])
    if (existing.rows.length) {
      throw createError({ statusCode: 409, message: 'Email already registered' })
    }

    const inserted = await db.query(
      `INSERT INTO users (email, password, name, role, phone, location)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, role, avatar, phone, location, bio, created_at`,
      [email, hashedPassword, name, role, phone || null, location || null],
    )
    user = inserted.rows[0]

    if (role === 'model') {
      await db.query(
        `INSERT INTO model_profiles (user_id, category, availability)
         VALUES ($1, 'Fashion', 'available')
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id],
      )
    }
  } else {
    const db = getDb()
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existing) {
      throw createError({ statusCode: 409, message: 'Email already registered' })
    }

    const result = db.prepare(`
      INSERT INTO users (email, password, name, role, phone, location)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(email, hashedPassword, name, role, phone || null, location || null)

    const userId = result.lastInsertRowid as number
    if (role === 'model') {
      db.prepare(`
        INSERT INTO model_profiles (user_id, category, availability)
        VALUES (?, 'Fashion', 'available')
      `).run(userId)
    }
    user = db.prepare('SELECT id, email, name, role, avatar, phone, location, bio, created_at FROM users WHERE id = ?').get(userId) as any
  }

  const token = await signToken({ userId: user.id, email: user.email, role: user.role })

  return { success: true, data: { user, token }, message: 'Account created successfully' }
})
