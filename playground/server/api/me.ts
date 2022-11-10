import { serverNhostUser } from '@nhost/server'

export default defineEventHandler(async (event) => {
  const user = await serverNhostUser(event)

  return user
})
