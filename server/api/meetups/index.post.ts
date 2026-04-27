import { getDb } from '~/server/db'
import { getUserFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const payload = await getUserFromEvent(event)
  if (!payload) throw createError({ statusCode: 401, message: 'Unauthorized' })

  if (payload.role !== 'client') {
    throw createError({ statusCode: 403, message: 'Only clients can request meetups' })
  }

  const body = await readBody(event)
  const { model_id, message, project_type, budget, preferred_date } = body

  if (!model_id || !message || !project_type) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const db = getDb()

  const model = db.prepare('SELECT id FROM model_profiles WHERE id = ?').get(model_id)
  if (!model) throw createError({ statusCode: 404, message: 'Model not found' })

  const existing = db.prepare(`
    SELECT id FROM meetup_requests
    WHERE client_id = ? AND model_id = ? AND status = 'pending'
  `).get(payload.userId as number, model_id)

  if (existing) {
    throw createError({ statusCode: 409, message: 'You already have a pending request with this model' })
  }

  const result = db.prepare(`
    INSERT INTO meetup_requests (client_id, model_id, message, project_type, budget, preferred_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(payload.userId as number, model_id, message, project_type, budget || null, preferred_date || null)

  const meetup = db.prepare('SELECT * FROM meetup_requests WHERE id = ?').get(result.lastInsertRowid as number)

  return { success: true, data: meetup, message: 'Meetup request sent successfully' }
})
