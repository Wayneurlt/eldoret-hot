import { getDb } from '~/server/db'
import { ensurePostgresSchema, getPgPool } from '~/server/db/postgres'
import { getUserFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const payload = await getUserFromEvent(event)
  if (!payload) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const config = useRuntimeConfig()
  let meetups: any[] = []

  if (config.databaseUrl) {
    await ensurePostgresSchema()
    const db = getPgPool()

    if (payload.role === 'client') {
      const res = await db.query(
        `
        SELECT mr.*,
          u_model.name as model_name, u_model.avatar as model_avatar,
          mp.category as model_category,
          (
            SELECT cm.message
            FROM chat_messages cm
            WHERE cm.meetup_id = mr.id
            ORDER BY cm.created_at DESC
            LIMIT 1
          ) as last_message,
          (
            SELECT cm.created_at
            FROM chat_messages cm
            WHERE cm.meetup_id = mr.id
            ORDER BY cm.created_at DESC
            LIMIT 1
          ) as last_message_at
        FROM meetup_requests mr
        JOIN model_profiles mp ON mr.model_id = mp.id
        JOIN users u_model ON mp.user_id = u_model.id
        WHERE mr.client_id = $1
        ORDER BY mr.updated_at DESC, mr.created_at DESC
        `,
        [Number(payload.userId)],
      )
      meetups = res.rows
    } else {
      const modelRes = await db.query('SELECT id FROM model_profiles WHERE user_id = $1 LIMIT 1', [Number(payload.userId)])
      const modelProfile = modelRes.rows[0]
      if (!modelProfile) return { success: true, data: [] }

      const res = await db.query(
        `
        SELECT mr.*,
          u_client.name as client_name, u_client.avatar as client_avatar,
          u_client.email as client_email,
          (
            SELECT cm.message
            FROM chat_messages cm
            WHERE cm.meetup_id = mr.id
            ORDER BY cm.created_at DESC
            LIMIT 1
          ) as last_message,
          (
            SELECT cm.created_at
            FROM chat_messages cm
            WHERE cm.meetup_id = mr.id
            ORDER BY cm.created_at DESC
            LIMIT 1
          ) as last_message_at
        FROM meetup_requests mr
        JOIN users u_client ON mr.client_id = u_client.id
        WHERE mr.model_id = $1
        ORDER BY mr.updated_at DESC, mr.created_at DESC
        `,
        [modelProfile.id],
      )
      meetups = res.rows
    }

    return { success: true, data: meetups }
  }

  const db = getDb()

  if (payload.role === 'client') {
    meetups = db.prepare(`
      SELECT mr.*,
        u_model.name as model_name, u_model.avatar as model_avatar,
        mp.category as model_category,
        (
          SELECT cm.message
          FROM chat_messages cm
          WHERE cm.meetup_id = mr.id
          ORDER BY cm.created_at DESC
          LIMIT 1
        ) as last_message,
        (
          SELECT cm.created_at
          FROM chat_messages cm
          WHERE cm.meetup_id = mr.id
          ORDER BY cm.created_at DESC
          LIMIT 1
        ) as last_message_at
      FROM meetup_requests mr
      JOIN model_profiles mp ON mr.model_id = mp.id
      JOIN users u_model ON mp.user_id = u_model.id
      WHERE mr.client_id = ?
      ORDER BY mr.updated_at DESC, mr.created_at DESC
    `).all(payload.userId as number) as any[]
  } else {
    const modelProfile = db.prepare('SELECT id FROM model_profiles WHERE user_id = ?').get(payload.userId as number) as any
    if (!modelProfile) return { success: true, data: [] }

    meetups = db.prepare(`
      SELECT mr.*,
        u_client.name as client_name, u_client.avatar as client_avatar,
        u_client.email as client_email,
        (
          SELECT cm.message
          FROM chat_messages cm
          WHERE cm.meetup_id = mr.id
          ORDER BY cm.created_at DESC
          LIMIT 1
        ) as last_message,
        (
          SELECT cm.created_at
          FROM chat_messages cm
          WHERE cm.meetup_id = mr.id
          ORDER BY cm.created_at DESC
          LIMIT 1
        ) as last_message_at
      FROM meetup_requests mr
      JOIN users u_client ON mr.client_id = u_client.id
      WHERE mr.model_id = ?
      ORDER BY mr.updated_at DESC, mr.created_at DESC
    `).all(modelProfile.id) as any[]
  }

  return { success: true, data: meetups }
})
