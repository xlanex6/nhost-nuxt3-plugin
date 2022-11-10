# Nuxt Nhost
A simple wrapper around [nhost-js](https://docs.nhost.io/reference/javascript) to enable usage and integration within Nuxt.

* Nuxt 3 ready
* Vue 3 composables
* Nhost-js V2
* Usage in API server routes
* Authentication support
* TypeScript support

## Overview
* [Introduction](#introduction)
* [Installation](#installation)
* [Options](#options)
* [Usage](#usage)
  * [Vue composables](#usage-vue-composables)
    * [useNhostClient](#usage-vue-composables-nhost-client)
      * [SignIn](#usage-vue-composables-nhost-client-sign-in)
      * [SignOut](#usage-vue-composables-nhost-client-sign-out)
    * [useNhostUser](#usage-vue-composables-nhost-user)
      * [Auth middleware](#usage-vue-composables-nhost-user-auth-middleware)
  * [Server services](#usage-server-services)
    * [serverNhostClient](#usage-server-services-nhost-client)
    * [serverNhostAdminSecret](#usage-server-services-nhost-admin-secret)
    * [serverNhostUser](#usage-server-services-nhost-user)

## Introduction <a name="introduction"></a>

@nuxtjs/nhost is a Nuxt module for first class integration with Nhost.<br>
Checkout the [Nuxt 3 documentation](https://v3.nuxtjs.org/getting-started/installation) and [Nhost](https://docs.nhost.io/reference/javascript) to learn more.

## Installation <a name="installation"></a>
Add @nuxtjs/nhost dev dependency to your project:

```
npm install @nuxtjs/nhost --save-dev
yarn add --dev @nuxtjs/nhost
```

Lastly, add NUXT_PUBLIC_NHOST_SUBDOMAIN and NUXT_PUBLIC_NHOST_REGION to the .env:
```
NUXT_PUBLIC_NHOST_SUBDOMAIN=""
NUXT_PUBLIC_NHOST_REGION=""
```

## Options <a name="options"></a>
You can configure the supabase module by using the nhost key in `nuxt.config.{ts,js}`:

```
import { defineNuxtConfig } from 'nuxt'
export default defineNuxtConfig({
  // ...
  nhost: {
    // Options
  }
}
```

### `backendUrl`
Default: `string` `''`<br>
The unique Nhost BACKEND_URL which is supplied when you create a new project in your project dashboard.

### `subdomain`
Default: `string` `process.env.NHOST_SUBDOMAIN` (e.g. ieingiwnginwnfnegqwvdqwdwq)<br>
The unique Nhost subdomain which is supplied when you create a new project in your project dashboard.

### `region`
Default: `string` `process.env.NHOST_REGION` (e.g. eu-central-1)<br>
The unique Nhost region which is supplied when you create a new project in your project dashboard.

### `adminSecret`
Default: `string` `''`<br>
When set, the admin secret is sent as a header, x-hasura-admin-secret, for all requests to GraphQL, Storage, and Serverless Functions.

### `cookie`
Default: `object`
```
{
  name: 'nhost',
  lifetime: 60 * 60 * 8,
  domain: '',
  path: '/',
  sameSite: 'lax'
}
```
The cookie settings to handle authentication state

## Usage <a name="usage"></a>

### Vue composables <a name="usage-vue-composables"></a>
[Auto-import](https://v3.nuxtjs.org/guide/directory-structure/composables/) your client inside your vue files.<br>

### useNhostClient <a name="usage-vue-composables-nhost-client"></a>
This composable is using nhost-js under the hood, it gives acces to the Nhost client.
```
<script setup>
  const client = useNhostClient()
  // Example: client.auth
  // Example: client.storage
  // Example: client.functions
  // Example: client.graphql
</script>
```

#### SignIn <a name="usage-vue-composables-nhost-client-sign-in"></a>
Check [Nhost Documentation](https://docs.nhost.io/reference/javascript/auth/sign-in) for further details.
```
<template>
  <div>
    <form @submit.prevent="login">
      <input v-model="email" type="email">
      <input v-model="password" type="password">
      <button type="submit">
        Login
      </button>
    </form>
  </div>
</template>

<script setup>
const { auth } = useNhostClient()

const email = useState('email', () => '')
const password = useState('password', () => '')

const login = async () => {
  await auth.signIn({
    email: email.value,
    password: password.value
  })
}
</script>
```

#### SignOut <a name="usage-vue-composables-nhost-client-sign-out"></a>
Check [Nhost Documentation](https://docs.nhost.io/reference/javascript/auth/sign-out) for further details.
```
<template>
  <button @click="logout">Logout</button>
</template>
<script setup>
const { auth } = useNhostClient()

const logout = async () => {
  await auth.signOut()
}
</script>
```

### useNhostUser <a name="usage-vue-composables-nhost-user"></a>
Once logged in, you can auto-import your user everywhere inside your vue files.
```
<script setup>
const user = useNhostUser()
</script>
```

#### Auth middleware <a name="usage-vue-composables-nhost-user-auth-middleware"></a>
You can protect your authenticated routes by creating a custom middleware in your project, here is an example:
```
export default defineNuxtRouteMiddleware((to, _from) => {
  const user = useNhostUser()
  if (!user.value) {
    return navigateTo('/login')
  }
})
```
Then you can reference your middleware in your page with:
```
definePageMeta({
  middleware: 'auth'
})
```
Learn more about [Nuxt middleware](https://v3.nuxtjs.org/guide/directory-structure/middleware/) and [definePageMeta](https://v3.nuxtjs.org/guide/directory-structure/pages/#page-metadata).

### Server services <a name="usage-server-services"></a>

### serverNhostClient <a name="usage-server-services-nhost-client"></a>
This function is working similary as the [useNhostClient](#usage-vue-composables-nhost-client) composable but is designed to be used in server routes.<br>
Define your server route and just import the serverNhostClient from `@nhost/server`.

server/api/customers.ts
```
import { serverNhostClient } from '@nhost/server'

export default defineEventHandler(async (event) => {
  const client = await serverNhostClient(event)
  
  const CUSTOMERS = gql`
    query {
      customers {
        id
        name
      }
    }
  `
  
  const { data, error } = await client.graphql.request(CUSTOMERS)
  
  return { customers: data }
})
```
Then call your API route from any vue file:
```
  const fetchCustomer = async () => {
    const { customers } = await $fetch('/api/customers')
  }
```
Be careful, if you want to call this route on SSR, please read this [section](https://v3.nuxtjs.org/getting-started/data-fetching/#isomorphic-fetch-and-fetch), you must send your browser cookies including your supabase token.
```
const { data: { customers }} = await useFetch('/api/customers', {
  headers: useRequestHeaders(['cookie'])
})
```

### serverNhostAdminSecret <a name="usage-server-services-nhost-admin-secret"></a>
This function is designed to work only in [server routes](https://v3.nuxtjs.org/guide/directory-structure/server/), there is no vue composable equivalent.<br>
It works similary as the serverNhostClient but it provides a client with admin rights that can bypass "admin mode".

`The client is initialized with the NHOST_ADMIN_SECRET you must have in your .env file. Checkout the doc if you want to know more about [admin secret](https://docs.nhost.io/reference/javascript/storage/set-admin-secret).`

Define your server route and just import the serverNhostAdminSecret from @nhost/server.
server/api/customers-sensitive.ts
```
import { serverNhostAdminSecret } from '@nhost/server'

export default defineEventHandler(async (event) => {
  const client = await serverNhostAdminSecret(event)
  
  const CUSTOMERS = gql`
    query {
      customers {
        id
        name
      }
    }
  `
  
  const { data, error } = await client.graphql.request(CUSTOMERS)
  
  return { customers: data }
})
```
Then call your API route from any vue file:
```
const fetchSensitiveData = async () => {
  const { customers } = await useFetch('/api/customers-sensitive')
}
```

### serverNhostUser <a name="usage-server-services-nhost-user"></a>
This function is similar to the [useNhostUser](##usage-vue-composables-nhost-user) composable but is used in server routes.<br>
Define your server route and import the serverNhostUser from @nhost/server.

server/api/me.ts
```
import { serverNhostUser } from '@nhost/server'

export default defineEventHandler(async (event) => {
  const user = await serverNhostUser(event)

  return user
})

```
Then call your API route from any vue file:
```
const userFromServer = useState('userFromServer', () => '')

const fetchUserFromServerRoute = async () => {
  userFromServer.value = await $fetch('/api/me')
}
```
Be careful, if you want to call this route on SSR, please read this [section](https://v3.nuxtjs.org/getting-started/data-fetching/#isomorphic-fetch-and-fetch), you must send your browser cookies including your nhost token.
```
const userFromServer = useState('userFromServer', () => '')

const { data } = await useFetch('/api/me', {
  headers: useRequestHeaders(['cookie'])
})

userFromServer.value = data
```
