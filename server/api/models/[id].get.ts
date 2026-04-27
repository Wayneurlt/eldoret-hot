import { getDb } from '~/server/db'
import { ensurePostgresSchema, getPgPool } from '~/server/db/postgres'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const config = useRuntimeConfig()
  let model: any
  let reviews: any[] = []

  if (config.databaseUrl) {
    await ensurePostgresSchema()
    const db = getPgPool()
    const modelRes = await db.query(
      `
      SELECT
        mp.*,
        u.name, u.avatar, u.location, u.bio, u.phone, u.email, u.created_at as member_since
      FROM model_profiles mp
      JOIN users u ON mp.user_id = u.id
      WHERE mp.id = $1
      `,
      [Number(id)],
    )
    model = modelRes.rows[0]
    reviews = []
  } else {
    const db = getDb()
    model = db.prepare(`
      SELECT
        mp.*,
        u.name, u.avatar, u.location, u.bio, u.phone, u.email, u.created_at as member_since
      FROM model_profiles mp
      JOIN users u ON mp.user_id = u.id
      WHERE mp.id = ?
    `).get(id) as any

    reviews = db.prepare(`
      SELECT r.*, u.name as reviewer_name, u.avatar as reviewer_avatar
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.model_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `).all(id) as any[]
  }

  if (!model) {
    throw createError({ statusCode: 404, message: 'Model not found' })
  }

  return {
    success: true,
    data: {
      ...model,
      portfolio_images: Array.isArray(model.portfolio_images) ? model.portfolio_images : JSON.parse(model.portfolio_images || '[]'),
      tags: Array.isArray(model.tags) ? model.tags : JSON.parse(model.tags || '[]'),
      verified: Boolean(model.verified),
      featured: Boolean(model.featured),
      reviews,
    },
  }
})
