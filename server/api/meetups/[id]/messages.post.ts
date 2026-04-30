import { getDb } from '~/server/db'
import { ensurePostgresSchema, getPgPool } from '~/server/db/postgres'
import { getUserFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const payload = await getUserFromEvent(event)
  if (!payload) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const message = String(body?.message || '').trim()
  if (!message) throw createError({ statusCode: 400, message: 'Message is required' })

  const config = useRuntimeConfig()
  if (config.databaseUrl) {
    await ensurePostgresSchema()
    const db = getPgPool()

    const chatRes = await db.query('SELECT * FROM meetup_requests WHERE id = $1', [id])
    const chat = chatRes.rows[0] as any
    if (!chat) throw createError({ statusCode: 404, message: 'Chat not found' })
    if (chat.status === 'rejected' || chat.status === 'completed') {
      throw createError({ statusCode: 400, message: 'Chat is closed' })
    }

    const isClient = Number(chat.client_id) === Number(payload.userId)
    const modelOwned =
      !!(await db.query('SELECT id FROM model_profiles WHERE id = $1 AND user_id = $2', [chat.model_id, Number(payload.userId)])).rows.length

    if (!isClient && !modelOwned) throw createError({ statusCode: 403, message: 'Forbidden' })

    const inserted = await db.query(
      `
      INSERT INTO chat_messages (meetup_id, sender_id, message)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [id, Number(payload.userId), message],
    )

    await db.query(`UPDATE meetup_requests SET updated_at = NOW() WHERE id = $1`, [id])

    const messageWithUser = await db.query(
      `
      SELECT cm.*, u.name as sender_name, u.avatar as sender_avatar, u.role as sender_role
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.id = $1
      `,
      [inserted.rows[0].id],
    )

    return { success: true, data: messageWithUser.rows[0] }
  }

  const db = getDb()
  const chat = db.prepare('SELECT * FROM meetup_requests WHERE id = ?').get(id) as any
  if (!chat) throw createError({ statusCode: 404, message: 'Chat not found' })
  if (chat.status === 'rejected' || chat.status === 'completed') {
    throw createError({ statusCode: 400, message: 'Chat is closed' })
  }

  const modelOwned = db.prepare('SELECT id FROM model_profiles WHERE id = ? AND user_id = ?').get(chat.model_id, payload.userId as number)
  const isClient = chat.client_id === payload.userId
  if (!isClient && !modelOwned) throw createError({ statusCode: 403, message: 'Forbidden' })

  const inserted = db.prepare(
    `INSERT INTO chat_messages (meetup_id, sender_id, message) VALUES (?, ?, ?)`
  ).run(id, payload.userId as number, message)

  db.prepare(`UPDATE meetup_requests SET updated_at = datetime('now') WHERE id = ?`).run(id)

  const full = db.prepare(`
    SELECT cm.*, u.name as sender_name, u.avatar as sender_avatar, u.role as sender_role
    FROM chat_messages cm
    JOIN users u ON cm.sender_id = u.id
    WHERE cm.id = ?
  `).get(inserted.lastInsertRowid as number)

  return { success: true, data: full }
})
