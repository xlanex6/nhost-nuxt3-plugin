import { NhostClient } from '@nhost/nhost-js'
import type { H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'

export const serverNhostAdminSecret = (event: H3Event): NhostClient => {
  const { nhost: { adminSecret }, public: { nhost: { subdomain, region } } } = useRuntimeConfig()

  // Make sure service key is set
  if (!adminSecret) {
    throw new Error('Missing `NHOST_ADMIN_SECRET` in `.env`')
  }

  // No need to recreate client if exists
  if (!event.context._supabaseServiceRole) {
    event.context._nhostAdminSecret = new NhostClient({
      subdomain,
      region,
      adminSecret
    })
  }

  return event.context._nhostAdminSecret as NhostClient
}
