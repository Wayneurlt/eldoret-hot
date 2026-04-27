import { getDb } from '~/server/db'
import { getUserFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const payload = await getUserFromEvent(event)
  if (!payload) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { status, response_message } = body

  if (!['accepted', 'rejected', 'completed'].includes(status)) {
    throw createError({ statusCode: 400, message: 'Invalid status' })
  }

  const db = getDb()
  const meetup = db.prepare('SELECT * FROM meetup_requests WHERE id = ?').get(id) as any

  if (!meetup) throw createError({ statusCode: 404, message: 'Meetup request not found' })

  if (payload.role === 'model') {
    const modelProfile = db.prepare('SELECT id FROM model_profiles WHERE user_id = ?').get(payload.userId as number) as any
    if (!modelProfile || modelProfile.id !== meetup.model_id) {
      throw createError({ statusCode: 403, message: 'Forbidden' })
    }
  } else if (payload.role === 'client') {
    if (meetup.client_id !== payload.userId) {
      throw createError({ statusCode: 403, message: 'Forbidden' })
    }
    if (status !== 'completed') {
      throw createError({ statusCode: 403, message: 'Clients can only mark meetups as completed' })
    }
  }

  db.prepare(`
    UPDATE meetup_requests
    SET status = ?, response_message = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(status, response_message || null, id)

  const updated = db.prepare('SELECT * FROM meetup_requests WHERE id = ?').get(id)
  return { success: true, data: updated, message: `Request ${status}` }
})
