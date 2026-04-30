import { getDb } from '~/server/db'
import { ensurePostgresSchema, getPgPool } from '~/server/db/postgres'
import { getUserFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const payload = await getUserFromEvent(event)
  if (!payload) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const id = Number(getRouterParam(event, 'id'))
  const config = useRuntimeConfig()

  if (config.databaseUrl) {
    await ensurePostgresSchema()
    const db = getPgPool()

    const chatRes = await db.query('SELECT * FROM meetup_requests WHERE id = $1', [id])
    const chat = chatRes.rows[0] as any
    if (!chat) throw createError({ statusCode: 404, message: 'Chat not found' })

    const allowed =
      Number(chat.client_id) === Number(payload.userId) ||
      !!(await db.query('SELECT id FROM model_profiles WHERE id = $1 AND user_id = $2', [chat.model_id, Number(payload.userId)])).rows.length

    if (!allowed) throw createError({ statusCode: 403, message: 'Forbidden' })

    const messagesRes = await db.query(
      `
      SELECT cm.*, u.name as sender_name, u.avatar as sender_avatar, u.role as sender_role
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.meetup_id = $1
      ORDER BY cm.created_at ASC
      `,
      [id],
    )

    return { success: true, data: messagesRes.rows, chat }
  }

  const db = getDb()
  const chat = db.prepare('SELECT * FROM meetup_requests WHERE id = ?').get(id) as any
  if (!chat) throw createError({ statusCode: 404, message: 'Chat not found' })

  const model = db.prepare('SELECT id FROM model_profiles WHERE id = ? AND user_id = ?').get(chat.model_id, payload.userId as number)
  const allowed = chat.client_id === payload.userId || !!model
  if (!allowed) throw createError({ statusCode: 403, message: 'Forbidden' })

  const messages = db.prepare(`
    SELECT cm.*, u.name as sender_name, u.avatar as sender_avatar, u.role as sender_role
    FROM chat_messages cm
    JOIN users u ON cm.sender_id = u.id
    WHERE cm.meetup_id = ?
    ORDER BY cm.created_at ASC
  `).all(id) as any[]

  return { success: true, data: messages, chat }
})
