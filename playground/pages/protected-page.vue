<template>
  <div>Protected Page</div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>
