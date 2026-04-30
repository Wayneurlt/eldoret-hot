<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue && model" class="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="close"></div>
        <div class="relative w-full max-w-5xl rounded-2xl border border-white/15 bg-[#120018] text-white shadow-2xl overflow-hidden">
          <button
            type="button"
            class="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 border border-white/20 hover:bg-brand-500 transition-colors inline-flex items-center justify-center"
            @click="close"
          >
            <Icon name="lucide:x" class="w-4 h-4" />
          </button>

          <div class="grid grid-cols-1 lg:grid-cols-2">
            <div class="relative bg-black/30 min-h-[360px] lg:min-h-[520px]">
              <img
                :src="currentImage"
                :alt="model.name"
                class="w-full h-full object-cover"
              />

              <button
                v-if="images.length > 1"
                type="button"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/25 hover:bg-black/70 inline-flex items-center justify-center"
                @click="prevSlide"
              >
                <Icon name="lucide:chevron-left" class="w-5 h-5" />
              </button>
              <button
                v-if="images.length > 1"
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/25 hover:bg-black/70 inline-flex items-center justify-center"
                @click="nextSlide"
              >
                <Icon name="lucide:chevron-right" class="w-5 h-5" />
              </button>

              <div v-if="images.length > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                <button
                  v-for="(_, idx) in images"
                  :key="`dot-${idx}`"
                  type="button"
                  class="w-2.5 h-2.5 rounded-full transition-all"
                  :class="idx === currentIndex ? 'bg-brand-400 w-6' : 'bg-white/40 hover:bg-white/70'"
                  @click="goToSlide(idx)"
                />
              </div>
            </div>

            <div class="p-6 lg:p-8 flex flex-col">
              <p class="text-brand-300 text-sm font-semibold tracking-widest uppercase mb-2">{{ model.cat }}</p>
              <h3 class="font-display text-3xl font-bold mb-3">{{ model.name }}</h3>
              <p class="text-white/70 text-sm flex items-center gap-2 mb-4">
                <Icon name="lucide:map-pin" class="w-4 h-4" />
                {{ model.location || 'Eldoret, Kenya' }}
              </p>
              <p class="text-white/80 leading-relaxed mb-6">
                {{ model.bio || defaultBio(model) }}
              </p>

              <div class="grid grid-cols-3 gap-3 mb-6">
                <div class="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                  <p class="text-brand-300 text-xs">Followers</p>
                  <p class="font-semibold">45K+</p>
                </div>
                <div class="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                  <p class="text-brand-300 text-xs">Projects</p>
                  <p class="font-semibold">120+</p>
                </div>
                <div class="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                  <p class="text-brand-300 text-xs">Rating</p>
                  <p class="font-semibold">4.9</p>
                </div>
              </div>

              <div class="mt-auto flex gap-3">
                <NuxtLink to="/register?role=client" class="btn-primary flex-1 text-center">Start Chat</NuxtLink>
                <NuxtLink to="/models" class="btn-secondary flex-1 text-center">Browse More</NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface SpotlightModel {
  name: string
  img: string
  cat: string
  location?: string
  bio?: string
  gallery?: string[]
}

const props = defineProps<{
  modelValue: boolean
  model: SpotlightModel | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const currentIndex = ref(0)

const images = computed(() => {
  if (!props.model) return []
  const set = props.model.gallery?.length ? props.model.gallery : [props.model.img]
  return Array.from(new Set(set))
})

const currentImage = computed(() => images.value[currentIndex.value] || props.model?.img || '')

watch(() => props.modelValue, (open) => {
  if (open) {
    currentIndex.value = 0
    if (import.meta.client) document.body.style.overflow = 'hidden'
  } else if (import.meta.client) {
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  if (import.meta.client) document.body.style.overflow = ''
})

function close() {
  emit('update:modelValue', false)
}

function nextSlide() {
  if (!images.value.length) return
  currentIndex.value = (currentIndex.value + 1) % images.value.length
}

function prevSlide() {
  if (!images.value.length) return
  currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length
}

function goToSlide(index: number) {
  currentIndex.value = index
}

function defaultBio(model: SpotlightModel) {
  return `${model.name} is a rising ${model.cat.toLowerCase()} creator known for authentic content, strong audience engagement, and premium visual storytelling.`
}

function onKey(e: KeyboardEvent) {
  if (!props.modelValue) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowRight') nextSlide()
  if (e.key === 'ArrowLeft') prevSlide()
}

onMounted(() => {
  if (!import.meta.client) return
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  if (!import.meta.client) return
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
