import { getDb } from '~/server/db'
import { ensurePostgresSchema, getPgPool } from '~/server/db/postgres'
import { getUserFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const payload = await getUserFromEvent(event)
  if (!payload) throw createError({ statusCode: 401, message: 'Unauthorized' })

  if (payload.role !== 'client') {
    throw createError({ statusCode: 403, message: 'Only organizations can initiate chats' })
  }

  const body = await readBody(event)
  const { model_id, message } = body

  if (!model_id || !message) {
    throw createError({ statusCode: 400, message: 'Missing required chat fields' })
  }

  const config = useRuntimeConfig()
  if (config.databaseUrl) {
    await ensurePostgresSchema()
    const db = getPgPool()

    // Accept either model profile id OR user id for safety.
    const profileById = await db.query('SELECT id FROM model_profiles WHERE id = $1 LIMIT 1', [Number(model_id)])
    let resolvedModelId = profileById.rows[0]?.id as number | undefined
    if (!resolvedModelId) {
      const profileByUser = await db.query('SELECT id FROM model_profiles WHERE user_id = $1 LIMIT 1', [Number(model_id)])
      resolvedModelId = profileByUser.rows[0]?.id
    }
    if (!resolvedModelId) throw createError({ statusCode: 404, message: 'Model not found' })

    const existing = await db.query(
      `SELECT id FROM meetup_requests WHERE client_id = $1 AND model_id = $2 AND status = 'pending' LIMIT 1`,
      [Number(payload.userId), resolvedModelId],
    )
    if (existing.rows.length) {
      throw createError({ statusCode: 409, message: 'You already have an open chat with this model' })
    }

    const inserted = await db.query(
      `
      INSERT INTO meetup_requests (client_id, model_id, message, project_type, budget, preferred_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [Number(payload.userId), resolvedModelId, message, 'Chat', null, null],
    )

    await db.query(
      `INSERT INTO chat_messages (meetup_id, sender_id, message) VALUES ($1, $2, $3)`,
      [inserted.rows[0].id, Number(payload.userId), message],
    )

    return { success: true, data: inserted.rows[0], message: 'Chat started successfully' }
  }

  const db = getDb()
  const model = db.prepare('SELECT id FROM model_profiles WHERE id = ?').get(model_id)
  if (!model) throw createError({ statusCode: 404, message: 'Model not found' })

  const existing = db.prepare(`
    SELECT id FROM meetup_requests
    WHERE client_id = ? AND model_id = ? AND status = 'pending'
  `).get(payload.userId as number, model_id)

  if (existing) {
    throw createError({ statusCode: 409, message: 'You already have an open chat with this model' })
  }

  const result = db.prepare(`
    INSERT INTO meetup_requests (client_id, model_id, message, project_type, budget, preferred_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(payload.userId as number, model_id, message, 'Chat', null, null)

  db.prepare(`
    INSERT INTO chat_messages (meetup_id, sender_id, message)
    VALUES (?, ?, ?)
  `).run(result.lastInsertRowid as number, payload.userId as number, message)

  const meetup = db.prepare('SELECT * FROM meetup_requests WHERE id = ?').get(result.lastInsertRowid as number)

  return { success: true, data: meetup, message: 'Chat started successfully' }
})
