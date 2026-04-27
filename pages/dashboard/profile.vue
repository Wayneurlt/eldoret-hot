<template>
  <div class="py-10">
    <div class="page-container max-w-3xl">
      <div class="flex items-center gap-4 mb-8">
        <NuxtLink to="/dashboard" class="w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors">
          <Icon name="lucide:arrow-left" class="w-4 h-4" />
        </NuxtLink>
        <div>
          <h1 class="section-title text-2xl">Edit Profile</h1>
          <p class="text-gray-400 text-sm">Update your information and settings</p>
        </div>
      </div>

      <form @submit.prevent="saveProfile" class="space-y-6">
        <!-- Avatar -->
        <div class="card p-6">
          <h2 class="font-semibold text-white mb-4">Profile Photo</h2>
          <div class="flex items-center gap-6">
            <img
              :src="form.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(form.name || 'U')}&backgroundColor=f97316`"
              :alt="form.name"
              class="w-20 h-20 rounded-full object-cover border-4 border-brand-500/30"
            />
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-300 mb-1.5">Photo URL</label>
              <input v-model="form.avatar" type="url" placeholder="https://..." class="input-field" />
              <p class="text-xs text-gray-500 mt-1">Paste a link to your profile photo (JPG, PNG)</p>
            </div>
          </div>
        </div>

        <!-- Basic Info -->
        <div class="card p-6 space-y-4">
          <h2 class="font-semibold text-white">Basic Information</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <input v-model="form.name" type="text" required class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
              <input v-model="form.phone" type="tel" placeholder="+254 7XX XXX XXX" class="input-field" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5">Location</label>
            <input v-model="form.location" type="text" placeholder="Eldoret, Kenya" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5">Bio / About You</label>
            <textarea v-model="form.bio" rows="4" placeholder="Tell clients about yourself, your style, experience, and what makes you unique..." class="input-field resize-none"></textarea>
            <p class="text-xs text-gray-500 mt-1">{{ form.bio?.length || 0 }} / 500 characters</p>
          </div>
        </div>

        <!-- Model-specific -->
        <div v-if="authStore.isModel" class="card p-6 space-y-4">
          <h2 class="font-semibold text-white">Model Profile</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">Primary Category</label>
              <select v-model="form.category" class="input-field">
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">Availability</label>
              <select v-model="form.availability" class="input-field">
                <option value="available">Available for Work</option>
                <option value="busy">Currently Busy</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5">Rates / Pricing</label>
            <input v-model="form.rates" type="text" placeholder="e.g. KES 5,000–15,000 per post" class="input-field" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">
                <Icon name="lucide:instagram" class="w-3.5 h-3.5 inline text-pink-400 mr-1" />Instagram
              </label>
              <div class="flex"><span class="bg-gray-700 border border-r-0 border-gray-700 rounded-l-xl px-3 flex items-center text-gray-500 text-sm">@</span>
              <input v-model="form.instagram" type="text" placeholder="username" class="input-field rounded-l-none" /></div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">
                <Icon name="lucide:twitter" class="w-3.5 h-3.5 inline text-sky-400 mr-1" />Twitter
              </label>
              <div class="flex"><span class="bg-gray-700 border border-r-0 border-gray-700 rounded-l-xl px-3 flex items-center text-gray-500 text-sm">@</span>
              <input v-model="form.twitter" type="text" placeholder="username" class="input-field rounded-l-none" /></div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">
                <Icon name="lucide:music-2" class="w-3.5 h-3.5 inline text-purple-400 mr-1" />TikTok
              </label>
              <div class="flex"><span class="bg-gray-700 border border-r-0 border-gray-700 rounded-l-xl px-3 flex items-center text-gray-500 text-sm">@</span>
              <input v-model="form.tiktok" type="text" placeholder="username" class="input-field rounded-l-none" /></div>
            </div>
          </div>

          <!-- Tags -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5">Tags / Skills</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <span v-for="tag in form.tags" :key="tag" class="flex items-center gap-1 bg-gray-800 text-gray-300 text-sm px-3 py-1 rounded-full">
                {{ tag }}
                <button type="button" @click="removeTag(tag)" class="text-gray-500 hover:text-red-400 ml-1">
                  <Icon name="lucide:x" class="w-3 h-3" />
                </button>
              </span>
            </div>
            <div class="flex gap-2">
              <input v-model="newTag" type="text" placeholder="Add a tag (e.g. Fashion, Beauty, Fitness)..." @keydown.enter.prevent="addTag" class="input-field flex-1" />
              <button type="button" @click="addTag" class="btn-outline px-4">Add</button>
            </div>
          </div>

          <!-- Portfolio Images -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5">Portfolio Images (URLs)</label>
            <div class="space-y-2 mb-2">
              <div v-for="(img, i) in form.portfolio_images" :key="i" class="flex gap-2">
                <input v-model="form.portfolio_images[i]" type="url" :placeholder="`Image ${i+1} URL`" class="input-field flex-1" />
                <button type="button" @click="removeImage(i)" class="w-10 h-10 rounded-xl bg-gray-800 hover:bg-red-500/20 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
                  <Icon name="lucide:trash-2" class="w-4 h-4" />
                </button>
              </div>
            </div>
            <button type="button" @click="form.portfolio_images.push('')" class="btn-secondary text-sm flex items-center gap-2">
              <Icon name="lucide:plus" class="w-4 h-4" />
              Add Image URL
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div v-if="successMsg" class="bg-green-500/10 border border-green-500/20 text-green-300 rounded-xl px-4 py-3 flex items-center gap-2">
          <Icon name="lucide:check-circle" class="w-4 h-4" />
          {{ successMsg }}
        </div>
        <div v-if="errorMsg" class="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 flex items-center gap-2">
          <Icon name="lucide:alert-circle" class="w-4 h-4" />
          {{ errorMsg }}
        </div>

        <div class="flex gap-3">
          <NuxtLink to="/dashboard" class="btn-secondary flex items-center gap-2">Cancel</NuxtLink>
          <button type="submit" :disabled="saving" class="btn-primary flex items-center gap-2">
            <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MODEL_CATEGORIES } from '~/types'
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const { apiFetch } = useApi()
const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const newTag = ref('')
const categories = MODEL_CATEGORIES

const form = reactive({
  name: authStore.user?.name || '',
  phone: authStore.user?.phone || '',
  location: authStore.user?.location || '',
  bio: authStore.user?.bio || '',
  avatar: authStore.user?.avatar || '',
  // model fields
  category: 'Fashion',
  availability: 'available',
  rates: '',
  instagram: '',
  twitter: '',
  tiktok: '',
  tags: [] as string[],
  portfolio_images: [] as string[],
})

// Load model profile if model
onMounted(async () => {
  if (authStore.isModel) {
    try {
      const res = await apiFetch<any>('/api/models/my-profile')
      const p = res.data
      form.category = p.category || 'Fashion'
      form.availability = p.availability || 'available'
      form.rates = p.rates || ''
      form.instagram = p.instagram || ''
      form.twitter = p.twitter || ''
      form.tiktok = p.tiktok || ''
      form.tags = JSON.parse(p.tags || '[]')
      form.portfolio_images = JSON.parse(p.portfolio_images || '[]').filter(Boolean)
    } catch {}
  }
})

function addTag() {
  const tag = newTag.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
    newTag.value = ''
  }
}

function removeTag(tag: string) {
  form.tags = form.tags.filter(t => t !== tag)
}

function removeImage(i: number) {
  form.portfolio_images.splice(i, 1)
}

async function saveProfile() {
  saving.value = true
  successMsg.value = ''
  errorMsg.value = ''
  try {
    const payload = {
      ...form,
      portfolio_images: form.portfolio_images.filter(u => u.trim()),
    }
    const res = await apiFetch<any>('/api/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.success) {
      authStore.user = res.data
      successMsg.value = 'Profile updated successfully!'
      setTimeout(() => { successMsg.value = '' }, 3000)
    }
  } catch (e: any) {
    errorMsg.value = e?.data?.message || 'Failed to save changes'
  } finally {
    saving.value = false
  }
}

useSeoMeta({ title: 'Edit Profile – Eldoret Hot' })
</script>
