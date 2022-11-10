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
const user = useNhostUser()

const email = useState('email', () => 'maximilian@unique-web.de')
const password = useState('password', () => 'password')

const login = async () => {
  await auth.signIn({
    email: email.value,
    password: password.value
  })
}

watchEffect(() => {
  if (user.value) {
    navigateTo('/')
  }
})
</script>
