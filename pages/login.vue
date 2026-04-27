<template>
  <div>
    <NuxtLayout name="auth">
      <div class="relative p-8 rounded-2xl border" style="background:rgba(20,0,30,0.8); backdrop-filter:blur(20px); border-color:rgba(247,37,133,0.2);">
        <!-- Logo -->
        <div class="text-center mb-8">
          <NuxtLink to="/" class="inline-flex items-center gap-2 mb-4">
            <div class="w-10 h-10 bg-gradient-to-br from-brand-500 to-orange-400 rounded-xl flex items-center justify-center">
              <Icon name="lucide:flame" class="text-white w-6 h-6" />
            </div>
            <span class="font-display font-bold text-2xl text-white">Eldoret <span class="gradient-text">Hot</span></span>
          </NuxtLink>
          <h1 class="text-2xl font-display font-bold text-white mb-1">Welcome back</h1>
          <p class="text-gray-400 text-sm">Sign in to your account</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
            <input
              v-model="form.email"
              type="email"
              required
              placeholder="you@example.com"
              autocomplete="email"
              class="input-field"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-sm font-medium text-gray-300">Password</label>
              <a href="#" class="text-xs text-brand-400 hover:text-brand-300">Forgot password?</a>
            </div>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                autocomplete="current-password"
                class="input-field pr-10"
              />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <p v-if="error" class="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
            <Icon name="lucide:alert-circle" class="w-4 h-4 flex-shrink-0" />
            {{ error }}
          </p>

          <button type="submit" :disabled="loading" class="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-400 mt-6">
          Don't have an account?
          <NuxtLink to="/register" class="text-brand-400 hover:text-brand-300 font-medium">Create one</NuxtLink>
        </p>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'guest' })

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const form = reactive({ email: '', password: '' })

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    const res = await $fetch<any>('/api/auth/login', {
      method: 'POST',
      body: form,
    })
    authStore.setAuth(res.data.user, res.data.token)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}

useSeoMeta({ title: 'Sign In – Eldoret Hot' })
</script>
