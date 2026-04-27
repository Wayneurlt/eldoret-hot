import { getDb } from '~/server/db'
import { ensurePostgresSchema, getPgPool } from '~/server/db/postgres'
import { getUserFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const payload = await getUserFromEvent(event)
  if (!payload) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const config = useRuntimeConfig()
  let user: any

  if (config.databaseUrl) {
    await ensurePostgresSchema()
    const db = getPgPool()
    const result = await db.query(
      'SELECT id, email, name, role, avatar, phone, location, bio, created_at FROM users WHERE id = $1',
      [Number(payload.userId)],
    )
    user = result.rows[0]
  } else {
    const db = getDb()
    user = db.prepare(
      'SELECT id, email, name, role, avatar, phone, location, bio, created_at FROM users WHERE id = ?'
    ).get(payload.userId as number) as any
  }

  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  return { success: true, data: user }
})
