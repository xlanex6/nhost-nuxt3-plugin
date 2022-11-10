import { fileURLToPath } from 'url'
import { defu } from 'defu'
import { defineNuxtModule, addPlugin, addServerHandler, createResolver, resolveModule, addTemplate } from '@nuxt/kit'
import { CookieOptions } from './runtime/types'

export interface ModuleOptions {
  /**
   * Nhost backend URL Should only be used when self-hosting
   * @default process.env.NHOST_BACKEND_URL
   * @type string
   */
  backendUrl: string,

  /**
   * Project subdomain (e.g. ieingiwnginwnfnegqwvdqwdwq) Use localhost during local development
   * @default process.env.NHOST_SUBDOMAIN
   * @type string
   */
  subdomain: string

  /**
   * Project region (e.g. eu-central-1) Project region is not required during local development (when subdomain is localhost)
   * @default process.env.NHOST_REGION
   * @type string
   */
  region: string

  /**
   * When set, the admin secret is sent as a header, x-hasura-admin-secret, for all requests to GraphQL, Storage, and Serverless Functions.
   * @default process.env.NHOST_ADMIN_SECRET
   * @type string
   */
  adminSecret: string

  /**
   * Nhost cookie options for session handling
   * @default {
      name: 'nhost',
      lifetime: 60 * 60 * 8,
      domain: '',
      path: '/',
      sameSite: 'lax'
    }
   * @type object
   */
  cookie?: CookieOptions
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxtjs/nhost',
    configKey: 'nhost'
  },
  defaults: {
    backendUrl: '' as string,
    subdomain: 'localhost' as string,
    region: '' as string,
    adminSecret: '' as string,
    cookie: {
      name: 'nhost',
      lifetime: 60 * 60 * 8,
      domain: '',
      path: '/',
      sameSite: 'lax'
    }
  },
  setup (options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const resolveRuntimeModule = (path: string) => resolveModule(path, { paths: resolve('./runtime') })

    // Make sure subdomain are set
    if (options.subdomain === 'localhost') {
      // eslint-disable-next-line no-console
      console.warn('Default `localhost` subdomain is defined! For production set `NHOST_SUBDOMAIN` in `.env`')
    }

    // Public runtimeConfig
    nuxt.options.runtimeConfig.public.nhost = defu(nuxt.options.runtimeConfig.public.nhost, {
      backendUrl: options.backendUrl,
      subdomain: options.subdomain,
      region: options.region,
      cookie: options.cookie
    })

    // Private runtimeConfig
    nuxt.options.runtimeConfig.nhost = defu(nuxt.options.runtimeConfig.nhost, {
      adminSecret: options.adminSecret
    })

    // Transpile runtime
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)

    addPlugin(resolve(runtimeDir, 'plugins', 'nhost.client'))
    addPlugin(resolve(runtimeDir, 'plugins', 'nhost.server'))

    addServerHandler({
      route: '/api/nhost/session',
      handler: resolve(runtimeDir, 'server/api/session')
    })

    // Add nhost composables
    nuxt.hook('imports:dirs', (dirs) => {
      dirs.push(resolve(runtimeDir, 'composables'))
    })

    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.alias = nitroConfig.alias || {}

      // Inline module runtime in Nitro bundle
      nitroConfig.externals = defu(typeof nitroConfig.externals === 'object' ? nitroConfig.externals : {}, {
        inline: [resolve('./runtime')]
      })
      nitroConfig.alias['@nhost/server'] = resolveRuntimeModule('./server/services')
    })

    addTemplate({
      filename: 'types/nhost.d.ts',
      getContents: () => [
        'declare module \'@nhost/server\' {',
        `  const serverNhostClient: typeof import('${resolve('./runtime/server/services')}').serverNhostClient`,
        `  const serverNhostAdminSecret: typeof import('${resolve('./runtime/server/services')}').serverNhostAdminSecret`,
        `  const serverNhostUser: typeof import('${resolve('./runtime/server/services')}').serverNhostUser`,
        '}'
      ].join('\n')
    })

    nuxt.hook('prepare:types', (options) => {
      options.references.push({ path: resolve(nuxt.options.buildDir, 'types/nhost.d.ts') })
    })
  }
})
