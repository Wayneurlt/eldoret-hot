<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center p-4">
    <div class="text-center max-w-md">
      <div class="w-20 h-20 bg-brand-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <Icon name="lucide:alert-triangle" class="w-10 h-10 text-brand-400" />
      </div>
      <h1 class="font-display font-bold text-5xl text-white mb-3">{{ error.statusCode }}</h1>
      <p class="text-gray-300 text-xl font-semibold mb-2">{{ error.statusCode === 404 ? 'Page Not Found' : 'Something went wrong' }}</p>
      <p class="text-gray-500 mb-8">{{ error.message || 'The page you are looking for does not exist.' }}</p>
      <NuxtLink to="/" class="btn-primary inline-flex items-center gap-2">
        <Icon name="lucide:home" class="w-4 h-4" />
        Go Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ error: { statusCode: number; message?: string } }>()
</script>
