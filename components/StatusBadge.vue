<template>
  <span class="badge text-xs capitalize" :class="classes">
    <span class="w-1.5 h-1.5 rounded-full inline-block" :class="dotClass"></span>
    {{ status }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{ status: string }>()

const classes = computed(() => ({
  'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20': props.status === 'pending',
  'bg-green-500/10 text-green-300 border border-green-500/20': props.status === 'accepted',
  'bg-red-500/10 text-red-300 border border-red-500/20': props.status === 'rejected',
  'bg-blue-500/10 text-blue-300 border border-blue-500/20': props.status === 'completed',
}))

const dotClass = computed(() => ({
  'bg-yellow-400': props.status === 'pending',
  'bg-green-400': props.status === 'accepted',
  'bg-red-400': props.status === 'rejected',
  'bg-blue-400': props.status === 'completed',
}))
</script>
