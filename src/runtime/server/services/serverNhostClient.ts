import { NhostClient } from '@nhost/nhost-js'
import { defu } from 'defu'
import { getCookie } from 'h3'
import type { H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'

export const serverNhostClient = (event: H3Event): NhostClient => {
  const { nhost: { backendUrl, subdomain, region, cookie: cookieOptions } } = useRuntimeConfig().public
  let constructorParams = { subdomain, region }

  if (backendUrl) {
    constructorParams = defu(constructorParams, { backendUrl })
  }

  // No need to recreate client if exists
  if (!event.context._nhostClient) {
    const token = getCookie(event, `${cookieOptions.name}-refresh-token`)

    event.context._nhostClient = new NhostClient({
      ...constructorParams
    })
    event.context._token = token
  }

  return event.context._nhostClient as NhostClient
}
