import { SignJWT, jwtVerify } from 'jose'
import type { H3Event } from 'h3'

export async function signToken(payload: Record<string, any>) {
  const config = useRuntimeConfig()
  const secret = new TextEncoder().encode(config.jwtSecret)
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string) {
  const config = useRuntimeConfig()
  const secret = new TextEncoder().encode(config.jwtSecret)
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export async function getUserFromEvent(event: H3Event) {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  return await verifyToken(token)
}

export function requireAuth(event: H3Event) {
  return async () => {
    const user = await getUserFromEvent(event)
    if (!user) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
    return user
  }
}
