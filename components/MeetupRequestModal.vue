<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('update:modelValue', false)"></div>

        <!-- Modal -->
        <div class="relative z-10 w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div>
              <h2 class="font-display font-bold text-xl text-white">Start Chat</h2>
              <p class="text-sm text-gray-400 mt-0.5">with <span class="text-brand-400 font-medium">{{ modelName }}</span></p>
            </div>
            <button @click="$emit('update:modelValue', false)" class="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <Icon name="lucide:x" class="w-4 h-4" />
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="submit" class="px-6 py-5 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">Message <span class="text-brand-400">*</span></label>
              <textarea
                v-model="form.message"
                required
                rows="5"
                placeholder="Say hello and share what you'd like to discuss..."
                class="input-field resize-none"
              ></textarea>
            </div>

            <p v-if="error" class="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{{ error }}</p>

            <div class="flex gap-3 pt-2">
              <button type="button" @click="$emit('update:modelValue', false)" class="btn-secondary flex-1">Cancel</button>
              <button type="submit" :disabled="loading" class="btn-primary flex-1 flex items-center justify-center gap-2">
                <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                {{ loading ? 'Starting...' : 'Start Chat' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  modelId: number
  modelName: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const authStore = useAuthStore()
const { apiFetch } = useApi()
const loading = ref(false)
const error = ref('')

const form = reactive({
  message: '',
})

async function submit() {
  if (!authStore.isAuthenticated) {
    navigateTo('/login')
    return
  }
  loading.value = true
  error.value = ''
  try {
    await apiFetch('/api/meetups', {
      method: 'POST',
      body: JSON.stringify({
        model_id: props.modelId,
        message: form.message,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    emit('success')
    emit('update:modelValue', false)
    Object.assign(form, { message: '' })
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Failed to start chat'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: all 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative, .modal-leave-to .relative {
  transform: scale(0.95) translateY(20px);
}
</style>
