import { getDb } from '~/server/db'
import { ensurePostgresSchema, getPgPool } from '~/server/db/postgres'
import { getUserFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const payload = await getUserFromEvent(event)
  if (!payload) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { status, response_message } = body

  const hasStatus = typeof status === 'string' && status.length > 0
  if (hasStatus && !['accepted', 'rejected', 'completed'].includes(status)) {
    throw createError({ statusCode: 400, message: 'Invalid status' })
  }

  const config = useRuntimeConfig()
  if (config.databaseUrl) {
    await ensurePostgresSchema()
    const db = getPgPool()
    const meetupRes = await db.query('SELECT * FROM meetup_requests WHERE id = $1', [Number(id)])
    const meetup = meetupRes.rows[0] as any

    if (!meetup) throw createError({ statusCode: 404, message: 'Meetup request not found' })

    if (payload.role === 'model') {
      const modelRes = await db.query('SELECT id FROM model_profiles WHERE user_id = $1 LIMIT 1', [Number(payload.userId)])
      const modelProfile = modelRes.rows[0] as any
      if (!modelProfile || modelProfile.id !== meetup.model_id) {
        throw createError({ statusCode: 403, message: 'Forbidden' })
      }
      if (!hasStatus && !response_message) {
        throw createError({ statusCode: 400, message: 'Reply message is required' })
      }
    } else if (payload.role === 'client') {
      if (Number(meetup.client_id) !== Number(payload.userId)) {
        throw createError({ statusCode: 403, message: 'Forbidden' })
      }
      if (!hasStatus || status !== 'completed') {
        throw createError({ statusCode: 403, message: 'Clients can only mark meetups as completed' })
      }
    }

    if (hasStatus) {
      await db.query(
        `UPDATE meetup_requests SET status = $1, response_message = COALESCE($2, response_message), updated_at = NOW() WHERE id = $3`,
        [status, response_message || null, Number(id)],
      )
    } else {
      await db.query(
        `UPDATE meetup_requests SET response_message = $1, updated_at = NOW() WHERE id = $2`,
        [response_message, Number(id)],
      )
    }

    const updatedRes = await db.query('SELECT * FROM meetup_requests WHERE id = $1', [Number(id)])
    return { success: true, data: updatedRes.rows[0], message: hasStatus ? `Request ${status}` : 'Reply sent' }
  }

  const db = getDb()
  const meetup = db.prepare('SELECT * FROM meetup_requests WHERE id = ?').get(id) as any

  if (!meetup) throw createError({ statusCode: 404, message: 'Meetup request not found' })

  if (payload.role === 'model') {
    const modelProfile = db.prepare('SELECT id FROM model_profiles WHERE user_id = ?').get(payload.userId as number) as any
    if (!modelProfile || modelProfile.id !== meetup.model_id) {
      throw createError({ statusCode: 403, message: 'Forbidden' })
    }
    if (!hasStatus && !response_message) {
      throw createError({ statusCode: 400, message: 'Reply message is required' })
    }
  } else if (payload.role === 'client') {
    if (meetup.client_id !== payload.userId) {
      throw createError({ statusCode: 403, message: 'Forbidden' })
    }
    if (!hasStatus || status !== 'completed') {
      throw createError({ statusCode: 403, message: 'Clients can only mark meetups as completed' })
    }
  }

  if (hasStatus) {
    db.prepare(`
      UPDATE meetup_requests
      SET status = ?, response_message = COALESCE(?, response_message), updated_at = datetime('now')
      WHERE id = ?
    `).run(status, response_message || null, id)
  } else {
    db.prepare(`
      UPDATE meetup_requests
      SET response_message = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(response_message, id)
  }

  const updated = db.prepare('SELECT * FROM meetup_requests WHERE id = ?').get(id)
  return { success: true, data: updated, message: hasStatus ? `Request ${status}` : 'Reply sent' }
})
