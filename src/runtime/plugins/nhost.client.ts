import { AuthChangeEvent } from '@nhost/hasura-auth-js/dist/utils/types'
import { NhostSession } from '@nhost/core'
import { defineNuxtPlugin } from '#app'
import { useNhostClient } from '../composables/useNhostClient'
import { useNhostUser } from '../composables/useNhostUser'
import { useRefreshToken } from '../composables/useRefreshToken'

export default defineNuxtPlugin(async (nuxtApp) => {
  const user = useNhostUser()
  const client = useNhostClient()
  const refreshToken = useRefreshToken()

  if (!user.value) {
    if (refreshToken.value) {
      await client.auth.refreshSession(refreshToken.value)
      user.value = client.auth.getUser()
    }
  }

  // Once Nuxt app is mounted
  nuxtApp.hooks.hook('app:mounted', () => {
    // Listen to nhost auth state changed
    client.auth.onAuthStateChanged(async (event: AuthChangeEvent, session: NhostSession) => {
      await setServerSession(event, session)
      user.value = client.auth.getUser()
    })
  })
})

const setServerSession = (event: AuthChangeEvent, session: NhostSession | null) => {
  return $fetch('/api/nhost/session', {
    method: 'POST',
    body: {
      event,
      session
    }
  })
}
