import { NhostClient } from '@nhost/nhost-js'
import { defu } from 'defu'
import { useRuntimeConfig, useNuxtApp } from '#imports'
import { NhostClientConstructorParams } from '@nhost/nhost-js/dist/utils/types'

export const useNhostClient = () => {
  const nuxtApp = useNuxtApp()
  const { nhost: { backendUrl, subdomain, region } } = useRuntimeConfig().public
  let constructorParams = { subdomain, region }

  if (backendUrl) {
    constructorParams = defu(constructorParams, { backendUrl })
  }

  // No need to recreate client if exists
  if (!nuxtApp._nhostClient) {
    nuxtApp._nhostClient = new NhostClient({
      ...constructorParams
    })
  }

  return nuxtApp._nhostClient
}
