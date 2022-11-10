import { readBody, setCookie, assertMethod, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

const config = useRuntimeConfig().public

export default defineEventHandler(async (event) => {
  assertMethod(event, 'POST')
  const body = await readBody(event)
  const cookieOptions = config.nhost.cookie

  const { event: signEvent, session } = body

  if (!event) {
    throw new Error('Auth event missing!')
  }

  if (signEvent === 'SIGNED_IN') {
    if (!session) {
      throw new Error('Auth session missing!')
    }

    setCookie(event, `${cookieOptions.name}-access-token`, session.accessToken, {
      domain: cookieOptions.domain,
      maxAge: cookieOptions.lifetime ?? 0,
      path: cookieOptions.path,
      sameSite: cookieOptions.sameSite as boolean | 'lax' | 'strict' | 'none'
    })

    setCookie(event, `${cookieOptions.name}-refresh-token`, session.refreshToken, {
      domain: cookieOptions.domain,
      maxAge: cookieOptions.lifetime ?? 0,
      path: cookieOptions.path,
      sameSite: cookieOptions.sameSite as boolean | 'lax' | 'strict' | 'none'
    })
  }

  if (signEvent === 'SIGNED_OUT') {
    setCookie(event, `${cookieOptions.name}-access-token`, '', {
      maxAge: -1,
      path: cookieOptions.path
    })

    setCookie(event, `${cookieOptions.name}-refresh-token`, '', {
      maxAge: -1,
      path: cookieOptions.path
    })
  }

  return {
    signEvent,
    session
  }
})
