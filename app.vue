<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const authStore = useAuthStore()

onMounted(() => {
  authStore.loadFromStorage()
  if (authStore.token) authStore.fetchMe()
})
</script>
