import { defineNuxtPlugin, NuxtApp } from '#app'
import { useNhostClient } from '../composables/useNhostClient'
import { useNhostUser } from '../composables/useNhostUser'
import { useRefreshToken } from '../composables/useRefreshToken'

export default defineNuxtPlugin(async () => {
  const user = useNhostUser()
  const client = useNhostClient()
  const refreshToken = useRefreshToken()

  if (!refreshToken.value) {
    return
  }

  const { error } = await client.auth.refreshSession(refreshToken.value)

  if (error) {
    refreshToken.value = ''
    user.value = null
  } else {
    user.value = await client.auth.getUser()
  }
})
