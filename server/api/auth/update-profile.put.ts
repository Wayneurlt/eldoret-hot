import { getDb } from '~/server/db'
import { ensurePostgresSchema, getPgPool } from '~/server/db/postgres'
import { getUserFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const payload = await getUserFromEvent(event)
  if (!payload) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event)
  const { name, phone, location, bio, avatar } = body

  const config = useRuntimeConfig()
  let updated: any

  if (config.databaseUrl) {
    await ensurePostgresSchema()
    const db = getPgPool()
    const userId = Number(payload.userId)

    await db.query(
      `UPDATE users
       SET name = $1, phone = $2, location = $3, bio = $4, avatar = $5
       WHERE id = $6`,
      [name, phone || null, location || null, bio || null, avatar || null, userId],
    )

    if (payload.role === 'model') {
      const { category, subcategory, rates, availability, instagram, twitter, tiktok, tags } = body
      await db.query(
        `INSERT INTO model_profiles (user_id, category, subcategory, rates, availability, instagram, twitter, tiktok, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
         ON CONFLICT (user_id) DO UPDATE
         SET category = EXCLUDED.category,
             subcategory = EXCLUDED.subcategory,
             rates = EXCLUDED.rates,
             availability = EXCLUDED.availability,
             instagram = EXCLUDED.instagram,
             twitter = EXCLUDED.twitter,
             tiktok = EXCLUDED.tiktok,
             tags = EXCLUDED.tags`,
        [
          userId,
          category || 'Fashion',
          subcategory || null,
          rates || null,
          availability || 'available',
          instagram || null,
          twitter || null,
          tiktok || null,
          JSON.stringify(tags || []),
        ],
      )
    }

    const result = await db.query(
      'SELECT id, email, name, role, avatar, phone, location, bio, created_at FROM users WHERE id = $1',
      [userId],
    )
    updated = result.rows[0]
  } else {
    const db = getDb()
    db.prepare(`
      UPDATE users SET name = ?, phone = ?, location = ?, bio = ?, avatar = ?
      WHERE id = ?
    `).run(name, phone || null, location || null, bio || null, avatar || null, payload.userId as number)

    if (payload.role === 'model') {
      const { category, subcategory, rates, availability, instagram, twitter, tiktok, tags } = body
      const existingProfile = db.prepare('SELECT id FROM model_profiles WHERE user_id = ?').get(payload.userId as number)
      if (existingProfile) {
        db.prepare(`
          UPDATE model_profiles
          SET category = ?, subcategory = ?, rates = ?, availability = ?,
              instagram = ?, twitter = ?, tiktok = ?, tags = ?
          WHERE user_id = ?
        `).run(
          category || 'Fashion',
          subcategory || null,
          rates || null,
          availability || 'available',
          instagram || null,
          twitter || null,
          tiktok || null,
          JSON.stringify(tags || []),
          payload.userId as number
        )
      }
    }

    updated = db.prepare(
      'SELECT id, email, name, role, avatar, phone, location, bio, created_at FROM users WHERE id = ?'
    ).get(payload.userId as number)
  }

  return { success: true, data: updated, message: 'Profile updated successfully' }
})
