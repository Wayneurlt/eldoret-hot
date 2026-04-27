import { getDb } from '~/server/db'
import { ensurePostgresSchema, getPgPool } from '~/server/db/postgres'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { category, availability, search, featured, page = 1, limit = 12 } = query

  const offset = (Number(page) - 1) * Number(limit)
  const config = useRuntimeConfig()

  if (config.databaseUrl) {
    await ensurePostgresSchema()
    const db = getPgPool()

    const whereConditions: string[] = ['1=1']
    const params: any[] = []
    let idx = 1

    if (category && category !== 'All') {
      whereConditions.push(`mp.category = $${idx++}`)
      params.push(category)
    }

    if (availability) {
      whereConditions.push(`mp.availability = $${idx++}`)
      params.push(availability)
    }

    if (featured === 'true') {
      whereConditions.push('mp.featured = TRUE')
    }

    if (search) {
      whereConditions.push(`(
        u.name ILIKE $${idx} OR
        COALESCE(u.bio, '') ILIKE $${idx} OR
        COALESCE(u.location, '') ILIKE $${idx} OR
        COALESCE(mp.tags::text, '') ILIKE $${idx}
      )`)
      params.push(`%${search}%`)
      idx++
    }

    const where = whereConditions.join(' AND ')
    params.push(Number(limit), offset)

    const modelsRes = await db.query(
      `
      SELECT
        mp.*,
        u.name, u.avatar, u.location, u.bio, u.phone, u.email
      FROM model_profiles mp
      JOIN users u ON mp.user_id = u.id
      WHERE ${where}
      ORDER BY mp.featured DESC, mp.rating DESC, mp.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
      `,
      params,
    )

    const countParams = params.slice(0, params.length - 2)
    const countRes = await db.query(
      `
      SELECT COUNT(*)::int as total
      FROM model_profiles mp
      JOIN users u ON mp.user_id = u.id
      WHERE ${where}
      `,
      countParams,
    )

    const result = modelsRes.rows.map((m: any) => ({
      ...m,
      portfolio_images: Array.isArray(m.portfolio_images) ? m.portfolio_images : [],
      tags: Array.isArray(m.tags) ? m.tags : [],
      verified: Boolean(m.verified),
      featured: Boolean(m.featured),
    }))

    const total = countRes.rows[0]?.total || 0
    return {
      success: true,
      data: result,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    }
  }

  const db = getDb()
  let whereConditions = ['1=1']
  const params: any[] = []

  if (category && category !== 'All') {
    whereConditions.push('mp.category = ?')
    params.push(category)
  }

  if (availability) {
    whereConditions.push('mp.availability = ?')
    params.push(availability)
  }

  if (featured === 'true') {
    whereConditions.push('mp.featured = 1')
  }

  if (search) {
    whereConditions.push('(u.name LIKE ? OR u.bio LIKE ? OR u.location LIKE ? OR mp.tags LIKE ?)')
    const searchTerm = `%${search}%`
    params.push(searchTerm, searchTerm, searchTerm, searchTerm)
  }

  const where = whereConditions.join(' AND ')

  const models = db.prepare(`
    SELECT
      mp.*,
      u.name, u.avatar, u.location, u.bio, u.phone,
      u.email
    FROM model_profiles mp
    JOIN users u ON mp.user_id = u.id
    WHERE ${where}
    ORDER BY mp.featured DESC, mp.rating DESC, mp.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, Number(limit), offset) as any[]

  const countResult = db.prepare(`
    SELECT COUNT(*) as total
    FROM model_profiles mp
    JOIN users u ON mp.user_id = u.id
    WHERE ${where}
  `).get(...params) as any

  const result = models.map(m => ({
    ...m,
    portfolio_images: JSON.parse(m.portfolio_images || '[]'),
    tags: JSON.parse(m.tags || '[]'),
    verified: Boolean(m.verified),
    featured: Boolean(m.featured),
  }))

  return {
    success: true,
    data: result,
    meta: {
      total: countResult.total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(countResult.total / Number(limit)),
    },
  }
})
