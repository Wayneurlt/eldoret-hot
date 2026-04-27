import bcrypt from 'bcryptjs'
import { getDb } from '~/server/db'
import { ensurePostgresSchema, getPgPool } from '~/server/db/postgres'
import { signToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email and password are required' })
  }

  const config = useRuntimeConfig()
  let user: any

  if (config.databaseUrl) {
    await ensurePostgresSchema()
    const db = getPgPool()
    const result = await db.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email])
    user = result.rows[0]
  } else {
    const db = getDb()
    user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any
  }

  if (!user) {
    throw createError({ statusCode: 401, message: 'Invalid email or password' })
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    throw createError({ statusCode: 401, message: 'Invalid email or password' })
  }

  const { password: _pw, ...safeUser } = user
  const token = await signToken({ userId: safeUser.id, email: safeUser.email, role: safeUser.role })

  return { success: true, data: { user: safeUser, token }, message: 'Login successful' }
})
