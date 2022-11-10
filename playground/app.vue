<template>
  <div>
    Nuxt module playground
    <NuxtPage />

    <button v-if="user" @click="logout">
      Logout
    </button>

    <NuxtLink v-else :to="{ name: 'login' }">
      Login
    </NuxtLink>

    <button v-if="user" @click="fetchUserFromServerRoute">
      Fetch user from server route!
    </button>

    <div v-if="userFromServer">
      {{ userFromServer }}
    </div>
  </div>
</template>

<script setup>
const { auth } = useNhostClient()
const user = useNhostUser()
const userFromServer = useState('userFromServer', () => '')

const logout = async () => {
  await auth.signOut()
}

const fetchUserFromServerRoute = async () => {
  const { data } = await useFetch('/api/me', {
    headers: useRequestHeaders(['cookie'])
  })

  userFromServer.value = data.value
}
</script>
