<template>
  <div class="py-10">
    <div class="page-container">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="section-title text-3xl mb-1">
            Welcome back, <span class="gradient-text">{{ authStore.user?.name?.split(' ')[0] }}</span>!
          </h1>
          <p class="text-gray-400 text-sm capitalize">{{ authStore.user?.role }} Account</p>
        </div>
        <NuxtLink to="/dashboard/profile" class="btn-outline flex items-center gap-2 self-start sm:self-auto">
          <Icon name="lucide:edit-3" class="w-4 h-4" />
          Edit Profile
        </NuxtLink>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div v-for="stat in stats" :key="stat.label" class="glass-card p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="stat.iconBg">
              <Icon :name="stat.icon" class="w-5 h-5" :class="stat.iconColor" />
            </div>
            <span v-if="stat.badge" class="badge-orange text-xs">{{ stat.badge }}</span>
          </div>
          <p class="text-2xl font-display font-bold text-white">{{ stat.value }}</p>
          <p class="text-gray-400 text-xs mt-1">{{ stat.label }}</p>
        </div>
      </div>

      <!-- Model Profile Completion (for models only) -->
      <div v-if="authStore.isModel && modelProfile" class="card p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display font-bold text-xl text-white">Profile Completion</h2>
          <span class="text-brand-400 font-bold text-lg">{{ profileCompletion }}%</span>
        </div>
        <div class="w-full bg-gray-800 rounded-full h-2 mb-4">
          <div class="bg-gradient-to-r from-brand-500 to-orange-400 h-2 rounded-full transition-all duration-500" :style="{ width: profileCompletion + '%' }"></div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div v-for="item in completionItems" :key="item.label" class="flex items-center gap-2 text-sm">
            <Icon :name="item.done ? 'lucide:check-circle-2' : 'lucide:circle'" :class="item.done ? 'text-green-400' : 'text-gray-600'" class="w-4 h-4 flex-shrink-0" />
            <span :class="item.done ? 'text-gray-300' : 'text-gray-500'">{{ item.label }}</span>
          </div>
        </div>
        <NuxtLink v-if="profileCompletion < 100" to="/dashboard/profile" class="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
          <Icon name="lucide:arrow-right" class="w-4 h-4" />
          Complete Profile
        </NuxtLink>
      </div>

      <!-- Meetup Requests -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-display font-bold text-xl text-white">Recent Meetup Requests</h2>
          <NuxtLink to="/meetups" class="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1">
            View All <Icon name="lucide:arrow-right" class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>

        <div v-if="meetupsLoading" class="space-y-3">
          <div v-for="n in 3" :key="n" class="h-16 bg-gray-800 rounded-xl animate-pulse"></div>
        </div>

        <div v-else-if="recentMeetups.length" class="space-y-3">
          <div v-for="meetup in recentMeetups" :key="meetup.id" class="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors">
            <img
              :src="(authStore.isModel ? meetup.client_avatar : meetup.model_avatar) || `https://api.dicebear.com/9.x/initials/svg?seed=U`"
              class="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div class="flex-1 min-w-0">
              <p class="text-white text-sm font-medium truncate">
                {{ authStore.isModel ? meetup.client_name : meetup.model_name }}
              </p>
              <p class="text-gray-400 text-xs truncate">{{ meetup.project_type }}</p>
            </div>
            <div class="text-right flex-shrink-0">
              <StatusBadge :status="meetup.status" />
              <p class="text-gray-500 text-xs mt-1">{{ new Date(meetup.created_at).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-10">
          <Icon name="lucide:calendar-x" class="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p class="text-gray-400 text-sm">No meetup requests yet</p>
          <NuxtLink v-if="authStore.isClient" to="/models" class="btn-primary inline-flex mt-4 text-sm items-center gap-2">
            <Icon name="lucide:search" class="w-4 h-4" />
            Browse Models
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const { apiFetch } = useApi()
const meetupsLoading = ref(true)
const recentMeetups = ref<any[]>([])
const modelProfile = ref<any>(null)

onMounted(async () => {
  try {
    const res = await apiFetch<any>('/api/meetups')
    recentMeetups.value = (res.data || []).slice(0, 5)
  } finally {
    meetupsLoading.value = false
  }

  if (authStore.isModel) {
    try {
      const res = await apiFetch<any>('/api/models/my-profile')
      modelProfile.value = res.data
    } catch {}
  }
})

const pendingMeetups = computed(() => recentMeetups.value.filter(m => m.status === 'pending').length)
const acceptedMeetups = computed(() => recentMeetups.value.filter(m => m.status === 'accepted').length)

const stats = computed(() => {
  if (authStore.isModel) {
    return [
      { label: 'Pending Requests', value: pendingMeetups.value, icon: 'lucide:clock', iconBg: 'bg-yellow-500/10', iconColor: 'text-yellow-400', badge: pendingMeetups.value > 0 ? 'New' : '' },
      { label: 'Accepted', value: acceptedMeetups.value, icon: 'lucide:check-circle', iconBg: 'bg-green-500/10', iconColor: 'text-green-400', badge: '' },
      { label: 'Total Requests', value: recentMeetups.value.length, icon: 'lucide:calendar', iconBg: 'bg-brand-500/10', iconColor: 'text-brand-400', badge: '' },
      { label: 'Profile Views', value: '—', icon: 'lucide:eye', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-400', badge: '' },
    ]
  }
  return [
    { label: 'Requests Sent', value: recentMeetups.value.length, icon: 'lucide:send', iconBg: 'bg-brand-500/10', iconColor: 'text-brand-400', badge: '' },
    { label: 'Accepted', value: acceptedMeetups.value, icon: 'lucide:check-circle', iconBg: 'bg-green-500/10', iconColor: 'text-green-400', badge: '' },
    { label: 'Pending', value: pendingMeetups.value, icon: 'lucide:clock', iconBg: 'bg-yellow-500/10', iconColor: 'text-yellow-400', badge: pendingMeetups.value > 0 ? 'Active' : '' },
    { label: 'Models Explored', value: '—', icon: 'lucide:search', iconBg: 'bg-purple-500/10', iconColor: 'text-purple-400', badge: '' },
  ]
})

const profileCompletion = computed(() => {
  if (!modelProfile.value) return 0
  const p = modelProfile.value
  const checks = [
    !!p.name, !!p.bio, !!p.avatar, !!p.phone, !!p.location,
    !!p.category, !!p.rates,
    (JSON.parse(p.portfolio_images || '[]').length > 0),
    (JSON.parse(p.tags || '[]').length > 0),
    !!(p.instagram || p.twitter || p.tiktok),
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
})

const completionItems = computed(() => {
  if (!modelProfile.value) return []
  const p = modelProfile.value
  return [
    { label: 'Full Name', done: !!p.name },
    { label: 'Bio / About', done: !!p.bio },
    { label: 'Profile Photo', done: !!p.avatar },
    { label: 'Phone Number', done: !!p.phone },
    { label: 'Location', done: !!p.location },
    { label: 'Category', done: !!p.category },
    { label: 'Rates', done: !!p.rates },
    { label: 'Portfolio Photos', done: (JSON.parse(p.portfolio_images || '[]').length > 0) },
    { label: 'Tags / Skills', done: (JSON.parse(p.tags || '[]').length > 0) },
    { label: 'Social Links', done: !!(p.instagram || p.twitter || p.tiktok) },
  ]
})

useSeoMeta({ title: 'Dashboard – Eldoret Hot' })
</script>
