<template>
  <NuxtLink :to="`/models/${model.id}`" class="group block relative overflow-hidden rounded-2xl cursor-pointer" style="aspect-ratio:2/3;">
    <!-- Photo -->
    <img
      :src="model.avatar || getFallbackImg(model.id)"
      :alt="model.name"
      class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      loading="lazy"
    />

    <!-- Base gradient overlay -->
    <div class="absolute inset-0 transition-opacity duration-300" style="background:linear-gradient(to top, rgba(13,0,21,0.98) 0%, rgba(13,0,21,0.4) 45%, transparent 75%)"></div>

    <!-- Hover pink tint -->
    <div class="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500" style="background:linear-gradient(to top, rgba(247,37,133,0.3) 0%, transparent 60%)"></div>

    <!-- Hover glow border -->
    <div class="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-brand-500/60 transition-all duration-300 shadow-none group-hover:shadow-glow-sm"></div>

    <!-- Top badges -->
    <div class="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
      <span v-if="model.featured" class="badge-pink text-xs">
        <Icon name="lucide:star" class="w-3 h-3 fill-current" /> Featured
      </span>
      <span v-if="model.verified" class="badge bg-blue-500/80 text-white text-xs border-0">
        <Icon name="lucide:badge-check" class="w-3 h-3" /> Verified
      </span>
    </div>

    <!-- Availability dot -->
    <div class="absolute top-3 right-3 z-10">
      <div
        class="w-3 h-3 rounded-full border-2 shadow-lg"
        :class="{
          'bg-green-400 border-green-900': model.availability === 'available',
          'bg-yellow-400 border-yellow-900': model.availability === 'busy',
          'bg-gray-500 border-gray-900': model.availability === 'unavailable',
        }"
      ></div>
    </div>

    <!-- Bottom info -->
    <div class="absolute bottom-0 left-0 right-0 p-4 z-10">
      <!-- Category -->
      <div class="mb-2">
        <span class="badge-pink text-xs">{{ model.category }}</span>
      </div>

      <!-- Name & location -->
      <h3 class="font-display font-bold text-white text-lg leading-tight">{{ model.name }}</h3>
      <div class="flex items-center justify-between mt-1.5">
        <div class="flex items-center gap-1 text-white/50 text-xs">
          <Icon name="lucide:map-pin" class="w-3 h-3" />
          <span>{{ model.location || 'Eldoret' }}</span>
        </div>
        <div v-if="model.rating" class="flex items-center gap-0.5 text-yellow-400 text-xs">
          <Icon name="lucide:star" class="w-3 h-3 fill-current" />
          <span class="font-semibold">{{ model.rating?.toFixed(1) }}</span>
        </div>
      </div>

      <!-- Rates -->
      <div v-if="model.rates" class="mt-2 pt-2 border-t border-white/10">
        <span class="text-brand-400 text-xs font-semibold">{{ model.rates }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { ModelProfile } from '~/types'

defineProps<{ model: ModelProfile }>()

const fashionIds = [
  '1529626426572-a9f2d4e8e2f0','1515886657613-9f3515b0c78f','1524502397800-2ece9d3b981d',
  '1488426862026-3ee34a7d66df','1469334031218-e382a71b716b','1534528741775-53994a69daeb',
  '1531746020798-e6953c6e8e04','1558618666-fcd25c85cd64','1508214751196-bcfd4ca60f91',
  '1509631179647-0177331693ae',
]

function getFallbackImg(id?: number) {
  const idx = (id || 0) % fashionIds.length
  return `https://images.unsplash.com/photo-${fashionIds[idx]}?w=400&h=600&fit=crop&q=80`
}
</script>
