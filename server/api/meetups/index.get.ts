import { getDb } from '~/server/db'
import { getUserFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const payload = await getUserFromEvent(event)
  if (!payload) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const db = getDb()
  let meetups: any[]

  if (payload.role === 'client') {
    meetups = db.prepare(`
      SELECT mr.*,
        u_model.name as model_name, u_model.avatar as model_avatar,
        mp.category as model_category
      FROM meetup_requests mr
      JOIN model_profiles mp ON mr.model_id = mp.id
      JOIN users u_model ON mp.user_id = u_model.id
      WHERE mr.client_id = ?
      ORDER BY mr.created_at DESC
    `).all(payload.userId as number) as any[]
  } else {
    const modelProfile = db.prepare('SELECT id FROM model_profiles WHERE user_id = ?').get(payload.userId as number) as any
    if (!modelProfile) return { success: true, data: [] }

    meetups = db.prepare(`
      SELECT mr.*,
        u_client.name as client_name, u_client.avatar as client_avatar,
        u_client.email as client_email
      FROM meetup_requests mr
      JOIN users u_client ON mr.client_id = u_client.id
      WHERE mr.model_id = ?
      ORDER BY mr.created_at DESC
    `).all(modelProfile.id) as any[]
  }

  return { success: true, data: meetups }
})
