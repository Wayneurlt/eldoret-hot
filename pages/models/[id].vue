<template>
  <div class="py-10" v-if="model">
    <div class="page-container">
      <!-- Back -->
      <NuxtLink to="/models" class="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
        <Icon name="lucide:arrow-left" class="w-4 h-4" />
        Back to Models
      </NuxtLink>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: Profile -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Avatar + basic -->
          <div class="card p-6 text-center">
            <div class="relative inline-block mb-4">
              <img
                :src="model.avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(model.name || 'model')}`"
                :alt="model.name"
                class="w-36 h-36 rounded-full object-cover border-4 border-brand-500/30 mx-auto"
              />
              <div
                class="absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-gray-900"
                :class="{
                  'bg-green-400': model.availability === 'available',
                  'bg-yellow-400': model.availability === 'busy',
                  'bg-gray-500': model.availability === 'unavailable',
                }"
              ></div>
            </div>

            <div class="flex items-center justify-center gap-2 mb-1">
              <h1 class="font-display font-bold text-2xl text-white">{{ model.name }}</h1>
              <Icon v-if="model.verified" name="lucide:badge-check" class="w-5 h-5 text-blue-400" title="Verified" />
            </div>

            <div class="flex items-center justify-center gap-1 text-gray-400 text-sm mb-3">
              <Icon name="lucide:map-pin" class="w-3.5 h-3.5" />
              <span>{{ model.location || 'Eldoret, Kenya' }}</span>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-2 mb-4">
              <span class="badge-orange">{{ model.category }}</span>
              <span
                class="badge text-xs"
                :class="{
                  'badge-green': model.availability === 'available',
                  'badge-yellow': model.availability === 'busy',
                  'bg-gray-700 text-gray-400': model.availability === 'unavailable',
                }"
              >
                {{ model.availability === 'available' ? 'Available' : model.availability === 'busy' ? 'Busy' : 'Unavailable' }}
              </span>
              <span v-if="model.featured" class="badge bg-brand-500/20 text-brand-300 border border-brand-500/30">
                <Icon name="lucide:star" class="w-3 h-3" /> Featured
              </span>
            </div>

            <!-- Rating -->
            <div v-if="model.rating" class="flex items-center justify-center gap-1 mb-4">
              <div class="flex">
                <Icon v-for="i in 5" :key="i" name="lucide:star" class="w-4 h-4" :class="i <= Math.round(model.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-600'" />
              </div>
              <span class="text-yellow-400 font-semibold text-sm ml-1">{{ model.rating?.toFixed(1) }}</span>
              <span class="text-gray-500 text-xs">({{ model.total_reviews }} reviews)</span>
            </div>

            <!-- Rates -->
            <div v-if="model.rates" class="bg-brand-500/10 border border-brand-500/20 rounded-xl px-4 py-2 mb-4 text-brand-300 text-sm font-medium">
              {{ model.rates }}
            </div>

            <!-- CTA -->
            <template v-if="authStore.isAuthenticated && authStore.isClient">
              <button @click="showMeetupModal = true" class="btn-primary w-full flex items-center justify-center gap-2">
                <Icon name="lucide:calendar-plus" class="w-4 h-4" />
                Request Meetup
              </button>
            </template>
            <template v-else-if="!authStore.isAuthenticated">
              <NuxtLink to="/login" class="btn-primary w-full flex items-center justify-center gap-2">
                <Icon name="lucide:log-in" class="w-4 h-4" />
                Sign In to Request
              </NuxtLink>
            </template>
            <template v-else-if="authStore.isModel">
              <p class="text-xs text-gray-500 mt-2">Models cannot request meetups with other models</p>
            </template>
          </div>

          <!-- Social Links -->
          <div v-if="model.instagram || model.twitter || model.tiktok" class="card p-5">
            <h3 class="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Social Media</h3>
            <div class="space-y-2">
              <a v-if="model.instagram" :href="`https://instagram.com/${model.instagram}`" target="_blank" rel="noopener" class="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm p-2 rounded-lg hover:bg-gray-800">
                <Icon name="lucide:instagram" class="w-5 h-5 text-pink-400" />
                @{{ model.instagram }}
              </a>
              <a v-if="model.twitter" :href="`https://twitter.com/${model.twitter}`" target="_blank" rel="noopener" class="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm p-2 rounded-lg hover:bg-gray-800">
                <Icon name="lucide:twitter" class="w-5 h-5 text-sky-400" />
                @{{ model.twitter }}
              </a>
              <div v-if="model.tiktok" class="flex items-center gap-3 text-gray-400 text-sm p-2 rounded-lg">
                <Icon name="lucide:music-2" class="w-5 h-5 text-purple-400" />
                @{{ model.tiktok }}
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="model.tags?.length" class="card p-5">
            <h3 class="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Specialties</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in model.tags" :key="tag" class="text-sm bg-gray-800 text-gray-300 px-3 py-1.5 rounded-full">{{ tag }}</span>
            </div>
          </div>
        </div>

        <!-- Right: Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- About -->
          <div class="card p-6">
            <h2 class="font-display font-bold text-xl text-white mb-4">About</h2>
            <p v-if="model.bio" class="text-gray-300 leading-relaxed">{{ model.bio }}</p>
            <p v-else class="text-gray-500 italic">No bio provided yet.</p>

            <div v-if="model.phone" class="flex items-center gap-2 mt-4 text-gray-400 text-sm">
              <Icon name="lucide:phone" class="w-4 h-4" />
              {{ model.phone }}
            </div>

            <div class="text-gray-500 text-xs mt-3">
              Member since {{ new Date(model.created_at || model.member_since).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) }}
            </div>
          </div>

          <!-- Portfolio -->
          <div v-if="model.portfolio_images?.length" class="card p-6">
            <h2 class="font-display font-bold text-xl text-white mb-4">Portfolio</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div
                v-for="(img, i) in model.portfolio_images"
                :key="i"
                class="aspect-square rounded-xl overflow-hidden bg-gray-800 cursor-pointer group"
                @click="lightboxIndex = i"
              >
                <img :src="img" :alt="`Portfolio ${i + 1}`" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            </div>
          </div>
          <div v-else class="card p-6">
            <h2 class="font-display font-bold text-xl text-white mb-3">Portfolio</h2>
            <div class="border-2 border-dashed border-gray-700 rounded-xl p-10 text-center text-gray-500">
              <Icon name="lucide:image" class="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p class="text-sm">No portfolio images yet</p>
            </div>
          </div>

          <!-- Reviews -->
          <div class="card p-6">
            <h2 class="font-display font-bold text-xl text-white mb-4">Reviews</h2>
            <div v-if="model.reviews?.length" class="space-y-4">
              <div v-for="review in model.reviews" :key="review.id" class="bg-gray-800/50 rounded-xl p-4">
                <div class="flex items-center gap-3 mb-2">
                  <img
                    :src="review.reviewer_avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(review.reviewer_name || 'U')}`"
                    :alt="review.reviewer_name"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p class="text-sm font-medium text-white">{{ review.reviewer_name }}</p>
                    <div class="flex">
                      <Icon v-for="i in 5" :key="i" name="lucide:star" class="w-3 h-3" :class="i <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'" />
                    </div>
                  </div>
                  <p class="ml-auto text-xs text-gray-500">{{ new Date(review.created_at).toLocaleDateString() }}</p>
                </div>
                <p v-if="review.comment" class="text-sm text-gray-300">{{ review.comment }}</p>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <Icon name="lucide:message-square" class="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p class="text-sm">No reviews yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <MeetupRequestModal
      v-if="model"
      v-model="showMeetupModal"
      :model-id="model.id"
      :model-name="model.name || ''"
      @success="onMeetupSuccess"
    />

    <!-- Success toast -->
    <Transition name="toast">
      <div v-if="successToast" class="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-50">
        <Icon name="lucide:check-circle" class="w-5 h-5" />
        Meetup request sent!
      </div>
    </Transition>
  </div>

  <div v-else class="py-24 text-center">
    <Icon name="lucide:user-x" class="w-16 h-16 text-gray-700 mx-auto mb-4" />
    <h2 class="text-2xl font-display font-bold text-gray-300 mb-2">Model Not Found</h2>
    <NuxtLink to="/models" class="btn-primary inline-flex mt-4">Browse All Models</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()
const showMeetupModal = ref(false)
const successToast = ref(false)
const lightboxIndex = ref<number | null>(null)

const { data } = await useFetch<any>(`/api/models/${route.params.id}`)
const model = computed(() => data.value?.data)

function onMeetupSuccess() {
  successToast.value = true
  setTimeout(() => { successToast.value = false }, 3500)
}

useSeoMeta({
  title: computed(() => model.value ? `${model.value.name} – Eldoret Hot` : 'Model – Eldoret Hot'),
  description: computed(() => model.value?.bio || ''),
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(20px); }
</style>
