import { User } from '@nhost/core'
import type { H3Event } from 'h3'
import { serverNhostClient } from './serverNhostClient'

export const serverNhostUser = async (event: H3Event): Promise<User | null> => {
  const client = serverNhostClient(event)
  const refreshToken = event.context._token

  if (!refreshToken) {
    return null
  }

  const { error } = await client.auth.refreshSession(refreshToken)

  if (!error) {
    event.context._user = await client.auth.getUser()
  }

  return event.context._user
}
