<template>
  <div class="py-10">
    <div class="page-container">
      <div class="mb-8">
        <h1 class="section-title text-3xl mb-2">Meetup Requests</h1>
        <p class="text-gray-400 text-sm">
          {{ authStore.isModel ? 'Manage requests from clients interested in working with you' : 'Track your meetup requests with models' }}
        </p>
      </div>

      <!-- Filter tabs -->
      <div class="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          :class="activeTab === tab.value ? 'bg-brand-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
        >
          {{ tab.label }}
          <span v-if="countByStatus(tab.value) > 0" class="bg-white/20 text-xs px-2 py-0.5 rounded-full">{{ countByStatus(tab.value) }}</span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div v-for="n in 4" :key="n" class="h-32 bg-gray-900 rounded-2xl animate-pulse"></div>
      </div>

      <!-- Meetups list -->
      <div v-else-if="filteredMeetups.length" class="space-y-4">
        <div v-for="meetup in filteredMeetups" :key="meetup.id" class="card p-5 hover:border-gray-700 transition-colors">
          <div class="flex items-start gap-4">
            <img
              :src="(authStore.isModel ? meetup.client_avatar : meetup.model_avatar) || `https://api.dicebear.com/9.x/initials/svg?seed=U`"
              class="w-12 h-12 rounded-full object-cover border-2 border-gray-700 flex-shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p class="font-semibold text-white">
                    {{ authStore.isModel ? meetup.client_name : meetup.model_name }}
                    <span v-if="authStore.isModel && meetup.client_email" class="text-gray-500 text-xs font-normal ml-2">{{ meetup.client_email }}</span>
                  </p>
                  <p class="text-brand-400 text-sm font-medium">{{ meetup.project_type }}</p>
                </div>
                <div class="flex-shrink-0 flex flex-col items-end gap-1">
                  <StatusBadge :status="meetup.status" />
                  <p class="text-gray-500 text-xs">{{ new Date(meetup.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }}</p>
                </div>
              </div>

              <p class="text-gray-300 text-sm mb-3 line-clamp-2">{{ meetup.message }}</p>

              <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span v-if="meetup.budget" class="flex items-center gap-1">
                  <Icon name="lucide:banknote" class="w-3.5 h-3.5" />
                  {{ meetup.budget }}
                </span>
                <span v-if="meetup.preferred_date" class="flex items-center gap-1">
                  <Icon name="lucide:calendar" class="w-3.5 h-3.5" />
                  {{ new Date(meetup.preferred_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) }}
                </span>
              </div>

              <!-- Response message -->
              <div v-if="meetup.response_message" class="mt-3 bg-gray-800 rounded-lg px-3 py-2">
                <p class="text-xs text-gray-400 font-medium mb-1">Response:</p>
                <p class="text-sm text-gray-300">{{ meetup.response_message }}</p>
              </div>

              <!-- Actions for model -->
              <div v-if="authStore.isModel && meetup.status === 'pending'" class="mt-4 flex gap-2">
                <button @click="respondToMeetup(meetup.id, 'accepted')" class="btn-primary text-sm px-4 py-2 flex items-center gap-1">
                  <Icon name="lucide:check" class="w-3.5 h-3.5" />
                  Accept
                </button>
                <button @click="openRejectModal(meetup)" class="btn-outline text-sm px-4 py-2 flex items-center gap-1 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500">
                  <Icon name="lucide:x" class="w-3.5 h-3.5" />
                  Decline
                </button>
              </div>

              <!-- Actions for client: mark complete -->
              <div v-if="authStore.isClient && meetup.status === 'accepted'" class="mt-4">
                <button @click="respondToMeetup(meetup.id, 'completed')" class="btn-secondary text-sm px-4 py-2 flex items-center gap-1">
                  <Icon name="lucide:check-circle" class="w-3.5 h-3.5" />
                  Mark as Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="text-center py-20">
        <Icon name="lucide:calendar-off" class="w-14 h-14 text-gray-700 mx-auto mb-4" />
        <h3 class="font-display font-bold text-xl text-gray-300 mb-2">No {{ activeTab === 'all' ? '' : activeTab }} requests</h3>
        <p class="text-gray-500 text-sm mb-6">
          {{ authStore.isClient ? 'Browse models and send a meetup request to get started.' : 'You have no requests in this category.' }}
        </p>
        <NuxtLink v-if="authStore.isClient" to="/models" class="btn-primary inline-flex items-center gap-2">
          <Icon name="lucide:search" class="w-4 h-4" />
          Browse Models
        </NuxtLink>
      </div>
    </div>

    <!-- Reject/Respond Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="rejectModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="rejectModalOpen = false"></div>
          <div class="relative z-10 w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <h3 class="font-display font-bold text-xl text-white mb-4">Decline Request</h3>
            <p class="text-gray-400 text-sm mb-4">You can optionally leave a message explaining your decision.</p>
            <textarea v-model="rejectMessage" rows="3" placeholder="Optional reason..." class="input-field resize-none mb-4"></textarea>
            <div class="flex gap-3">
              <button @click="rejectModalOpen = false" class="btn-secondary flex-1">Cancel</button>
              <button @click="confirmReject" :disabled="actionLoading" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                <Icon v-if="actionLoading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                Decline Request
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const { apiFetch } = useApi()
const loading = ref(true)
const meetups = ref<any[]>([])
const activeTab = ref('all')
const rejectModalOpen = ref(false)
const rejectMessage = ref('')
const selectedMeetup = ref<any>(null)
const actionLoading = ref(false)

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Completed', value: 'completed' },
  { label: 'Declined', value: 'rejected' },
]

onMounted(async () => {
  await fetchMeetups()
})

async function fetchMeetups() {
  loading.value = true
  try {
    const res = await apiFetch<any>('/api/meetups')
    meetups.value = res.data || []
  } finally {
    loading.value = false
  }
}

const filteredMeetups = computed(() =>
  activeTab.value === 'all'
    ? meetups.value
    : meetups.value.filter(m => m.status === activeTab.value)
)

function countByStatus(status: string) {
  if (status === 'all') return meetups.value.length
  return meetups.value.filter(m => m.status === status).length
}

function openRejectModal(meetup: any) {
  selectedMeetup.value = meetup
  rejectMessage.value = ''
  rejectModalOpen.value = true
}

async function confirmReject() {
  if (!selectedMeetup.value) return
  actionLoading.value = true
  try {
    await apiFetch(`/api/meetups/${selectedMeetup.value.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'rejected', response_message: rejectMessage.value }),
      headers: { 'Content-Type': 'application/json' },
    })
    await fetchMeetups()
    rejectModalOpen.value = false
  } finally {
    actionLoading.value = false
  }
}

async function respondToMeetup(id: number, status: string, message = '') {
  try {
    await apiFetch(`/api/meetups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, response_message: message }),
      headers: { 'Content-Type': 'application/json' },
    })
    await fetchMeetups()
  } catch {}
}

useSeoMeta({ title: 'Meetup Requests – Eldoret Hot' })
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
