<template>
  <div>
    <NuxtLayout name="auth">
      <div class="relative p-8 rounded-2xl border" style="background:rgba(20,0,30,0.8); backdrop-filter:blur(20px); border-color:rgba(247,37,133,0.2);">
        <div class="text-center mb-8">
          <NuxtLink to="/" class="inline-flex items-center gap-2 mb-4">
            <div class="w-10 h-10 bg-gradient-to-br from-brand-500 to-orange-400 rounded-xl flex items-center justify-center">
              <Icon name="lucide:flame" class="text-white w-6 h-6" />
            </div>
            <span class="font-display font-bold text-2xl text-white">Eldoret <span class="gradient-text">Hot</span></span>
          </NuxtLink>
          <h1 class="text-2xl font-display font-bold text-white mb-1">Create Account</h1>
          <p class="text-gray-400 text-sm">Join Eldoret's top talent platform</p>
        </div>

        <!-- Role Toggle -->
        <div class="flex bg-gray-800 rounded-xl p-1 mb-6">
          <button
            type="button"
            @click="form.role = 'client'"
            :class="form.role === 'client' ? 'bg-brand-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'"
            class="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200"
          >
            <Icon name="lucide:building-2" class="w-4 h-4" />
            I'm a Client / Brand
          </button>
          <button
            type="button"
            @click="form.role = 'model'"
            :class="form.role === 'model' ? 'bg-brand-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'"
            class="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200"
          >
            <Icon name="lucide:sparkles" class="w-4 h-4" />
            I'm a Model
          </button>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <input v-model="form.name" type="text" required placeholder="Jane Wanjiku" autocomplete="name" class="input-field" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
              <input v-model="form.email" type="email" required placeholder="you@example.com" autocomplete="email" class="input-field" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
              <input v-model="form.phone" type="tel" placeholder="+254 7XX XXX XXX" class="input-field" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">Location</label>
              <input v-model="form.location" type="text" placeholder="Eldoret, Kenya" class="input-field" />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-sm font-medium text-gray-300">Password</label>
              </div>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="At least 6 characters"
                  autocomplete="new-password"
                  class="input-field pr-10"
                />
                <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Model extra info -->
          <div v-if="form.role === 'model'" class="bg-brand-500/5 border border-brand-500/20 rounded-xl p-4 text-sm text-brand-300">
            <p class="flex items-center gap-2 font-medium mb-1">
              <Icon name="lucide:info" class="w-4 h-4" />
              Model Profile Setup
            </p>
            <p class="text-gray-400">After registration, you'll complete your model profile with photos, categories, rates, and social links.</p>
          </div>

          <p v-if="error" class="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
            <Icon name="lucide:alert-circle" class="w-4 h-4 flex-shrink-0" />
            {{ error }}
          </p>

          <p class="text-xs text-gray-500 text-center">
            By registering, you agree to our
            <a href="#" class="text-brand-400 hover:underline">Terms of Service</a> and
            <a href="#" class="text-brand-400 hover:underline">Privacy Policy</a>.
          </p>

          <button type="submit" :disabled="loading" class="btn-primary w-full flex items-center justify-center gap-2">
            <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-400 mt-6">
          Already have an account?
          <NuxtLink to="/login" class="text-brand-400 hover:text-brand-300 font-medium">Sign in</NuxtLink>
        </p>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'guest' })

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  location: '',
  password: '',
  role: (route.query.role as 'model' | 'client') || 'client',
})

async function handleRegister() {
  loading.value = true
  error.value = ''
  try {
    const res = await $fetch<any>('/api/auth/register', {
      method: 'POST',
      body: form,
    })
    authStore.setAuth(res.data.user, res.data.token)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e?.data?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}

useSeoMeta({ title: 'Create Account – Eldoret Hot' })
</script>
