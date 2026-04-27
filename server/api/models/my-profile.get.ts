import { getDb } from '~/server/db'
import { ensurePostgresSchema, getPgPool } from '~/server/db/postgres'
import { getUserFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const payload = await getUserFromEvent(event)
  if (!payload) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const config = useRuntimeConfig()
  let profile: any

  if (config.databaseUrl) {
    await ensurePostgresSchema()
    const db = getPgPool()
    const res = await db.query(
      `
      SELECT mp.*, u.name, u.avatar, u.location, u.bio, u.phone, u.email
      FROM model_profiles mp
      JOIN users u ON mp.user_id = u.id
      WHERE mp.user_id = $1
      `,
      [Number(payload.userId)],
    )
    profile = res.rows[0]
  } else {
    const db = getDb()
    profile = db.prepare(`
      SELECT mp.*, u.name, u.avatar, u.location, u.bio, u.phone, u.email
      FROM model_profiles mp
      JOIN users u ON mp.user_id = u.id
      WHERE mp.user_id = ?
    `).get(payload.userId as number) as any
  }

  if (!profile) {
    throw createError({ statusCode: 404, message: 'Model profile not found' })
  }

  return {
    success: true,
    data: {
      ...profile,
      portfolio_images: Array.isArray(profile.portfolio_images) ? profile.portfolio_images : JSON.parse(profile.portfolio_images || '[]'),
      tags: Array.isArray(profile.tags) ? profile.tags : JSON.parse(profile.tags || '[]'),
      verified: Boolean(profile.verified),
      featured: Boolean(profile.featured),
    },
  }
})
