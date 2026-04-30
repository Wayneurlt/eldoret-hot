<template>
  <div class="py-10">
    <div class="page-container">
      <div class="mb-8">
        <h1 class="section-title text-3xl mb-2">Chats</h1>
        <p class="text-gray-400 text-sm">
          {{ authStore.isModel ? 'Manage incoming chats from organizations interested in working with you' : 'Track your chats with models' }}
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

      <!-- Chats list -->
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
                  <p class="text-brand-400 text-sm font-medium">Chat</p>
                </div>
                <div class="flex-shrink-0 flex flex-col items-end gap-1">
                  <StatusBadge :status="meetup.status" />
                  <p class="text-gray-500 text-xs">{{ new Date(meetup.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }}</p>
                </div>
              </div>

              <p class="text-gray-300 text-sm mb-3 line-clamp-2">{{ meetup.last_message || meetup.response_message || meetup.message }}</p>

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
              <div v-if="authStore.isModel" class="mt-4 flex gap-2 flex-wrap">
                <button @click="openChatModal(meetup)" class="btn-secondary text-sm px-4 py-2 flex items-center gap-1">
                  <Icon name="lucide:messages-square" class="w-3.5 h-3.5" />
                  Chat
                </button>
                <button v-if="['pending', 'accepted'].includes(meetup.status)" @click="respondToMeetup(meetup.id, 'accepted')" class="btn-primary text-sm px-4 py-2 flex items-center gap-1">
                  <Icon name="lucide:check" class="w-3.5 h-3.5" />
                  Open
                </button>
                <button v-if="['pending', 'accepted'].includes(meetup.status)" @click="openRejectModal(meetup)" class="btn-outline text-sm px-4 py-2 flex items-center gap-1 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500">
                  <Icon name="lucide:x" class="w-3.5 h-3.5" />
                  Close
                </button>
              </div>

              <!-- Actions for client: mark complete -->
              <div v-if="authStore.isClient" class="mt-4 flex gap-2">
                <button @click="openChatModal(meetup)" class="btn-secondary text-sm px-4 py-2 flex items-center gap-1">
                  <Icon name="lucide:messages-square" class="w-3.5 h-3.5" />
                  Chat
                </button>
                <button v-if="meetup.status === 'accepted'" @click="respondToMeetup(meetup.id, 'completed')" class="btn-secondary text-sm px-4 py-2 flex items-center gap-1">
                  <Icon name="lucide:check-circle" class="w-3.5 h-3.5" />
                  Mark Closed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="text-center py-20">
        <Icon name="lucide:messages-square" class="w-14 h-14 text-gray-700 mx-auto mb-4" />
        <h3 class="font-display font-bold text-xl text-gray-300 mb-2">No {{ activeTab === 'all' ? '' : activeTab }} chats</h3>
        <p class="text-gray-500 text-sm mb-6">
          {{ authStore.isClient ? 'Browse models and start a chat to get started.' : 'You have no chats in this category.' }}
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
            <h3 class="font-display font-bold text-xl text-white mb-4">Close Chat</h3>
            <p class="text-gray-400 text-sm mb-4">You can optionally leave a message before closing this chat.</p>
            <textarea v-model="rejectMessage" rows="3" placeholder="Optional reason..." class="input-field resize-none mb-4"></textarea>
            <div class="flex gap-3">
              <button @click="rejectModalOpen = false" class="btn-secondary flex-1">Cancel</button>
              <button @click="confirmReject" :disabled="actionLoading" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                <Icon v-if="actionLoading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                Close Chat
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Chat Modal (back-and-forth) -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="chatModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="chatModalOpen = false"></div>
          <div class="relative z-10 w-full max-w-3xl bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 class="font-display font-bold text-xl text-white">Chat</h3>
                <p class="text-xs text-gray-400">Back-and-forth conversation</p>
              </div>
              <button @click="chatModalOpen = false" class="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white">
                <Icon name="lucide:x" class="w-4 h-4" />
              </button>
            </div>

            <div class="h-[420px] overflow-y-auto p-4 space-y-3 bg-gray-950/40" ref="messagesContainerRef">
              <div v-if="showInitialChatLoading" class="text-center text-gray-500 text-sm py-10">Loading chat...</div>
              <div v-else-if="chatError" class="text-center py-10">
                <p class="text-red-300 text-sm mb-3">{{ chatError }}</p>
                <button @click="fetchMessages" class="btn-secondary text-sm">Retry</button>
              </div>
              <div v-else-if="!messages.length" class="text-center text-gray-500 text-sm py-10">No messages yet</div>
              <div
                v-for="msg in messages"
                :key="msg.id"
                class="flex"
                :class="Number(msg.sender_id) === Number(authStore.user?.id) ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[80%] rounded-2xl px-4 py-2.5"
                  :class="Number(msg.sender_id) === Number(authStore.user?.id) ? 'bg-brand-500 text-white' : 'bg-gray-800 text-gray-200'"
                >
                  <p class="text-xs opacity-80 mb-1">{{ msg.sender_name }} • {{ msg.sender_role }}</p>
                  <p class="text-sm whitespace-pre-wrap break-words">{{ msg.message }}</p>
                  <p class="text-[11px] opacity-60 mt-1">{{ new Date(msg.created_at).toLocaleString() }}</p>
                </div>
              </div>
            </div>

            <form @submit.prevent="sendMessage" class="p-4 border-t border-gray-800 bg-gray-900">
              <div class="flex gap-2 items-end">
                <textarea
                  v-model="newMessage"
                  rows="2"
                  placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                  class="input-field flex-1 resize-none"
                  @keydown="onMessageKeydown"
                ></textarea>
                <button type="submit" :disabled="sendingMessage || !newMessage.trim() || selectedMeetup?.status === 'rejected' || selectedMeetup?.status === 'completed'" class="btn-primary px-4 flex items-center gap-2">
                  <Icon v-if="sendingMessage" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                  Send
                </button>
              </div>
              <p v-if="sendError" class="text-xs text-red-300 mt-2">{{ sendError }}</p>
              <p v-if="selectedMeetup?.status === 'rejected' || selectedMeetup?.status === 'completed'" class="text-xs text-yellow-300 mt-2">
                Chat is closed and cannot receive new messages.
              </p>
            </form>
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
const chatModalOpen = ref(false)
const chatLoading = ref(false)
const sendingMessage = ref(false)
const chatError = ref('')
const sendError = ref('')
const messages = ref<any[]>([])
const newMessage = ref('')
const messagesContainerRef = ref<HTMLElement | null>(null)
let chatPollTimer: ReturnType<typeof setInterval> | null = null
const wasNearBottom = ref(true)
const hasLoadedMessages = ref(false)
const showInitialChatLoading = computed(() => chatLoading.value && !hasLoadedMessages.value)

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

async function openChatModal(meetup: any) {
  selectedMeetup.value = meetup
  chatModalOpen.value = true
  newMessage.value = ''
  chatError.value = ''
  sendError.value = ''
  hasLoadedMessages.value = false
  await fetchMessages()
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

async function fetchMessages() {
  if (!selectedMeetup.value) return
  if (messagesContainerRef.value) {
    const el = messagesContainerRef.value
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    wasNearBottom.value = distanceFromBottom < 120
  }
  chatLoading.value = true
  chatError.value = ''
  try {
    const res = await apiFetch<any>(`/api/meetups/${selectedMeetup.value.id}/messages`)
    const prevLength = messages.value.length
    messages.value = res.data || []
    hasLoadedMessages.value = true
    if (messages.value.length > prevLength || wasNearBottom.value) {
      await nextTick()
      if (messagesContainerRef.value) {
        messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
      }
    }
  } catch (e: any) {
    chatError.value = e?.data?.message || e?.message || 'Failed to load messages'
  } finally {
    chatLoading.value = false
  }
}

async function sendMessage() {
  if (!selectedMeetup.value || !newMessage.value.trim()) return
  sendError.value = ''
  const text = newMessage.value.trim()
  const tempId = `temp-${Date.now()}`
  const optimistic = {
    id: tempId,
    sender_id: authStore.user?.id,
    sender_name: authStore.user?.name,
    sender_role: authStore.user?.role,
    message: text,
    created_at: new Date().toISOString(),
  }
  messages.value.push(optimistic)
  newMessage.value = ''
  await nextTick()
  if (messagesContainerRef.value) {
    messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
  }

  sendingMessage.value = true
  try {
    await apiFetch(`/api/meetups/${selectedMeetup.value.id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message: text }),
      headers: { 'Content-Type': 'application/json' },
    })
    await fetchMessages()
    await fetchMeetups()
  } catch (e) {
    messages.value = messages.value.filter((m: any) => m.id !== tempId)
    sendError.value = 'Failed to send message. Please retry.'
  } finally {
    sendingMessage.value = false
  }
}

function onMessageKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

watch(chatModalOpen, (open) => {
  if (chatPollTimer) {
    clearInterval(chatPollTimer)
    chatPollTimer = null
  }
  if (open) {
    chatPollTimer = setInterval(() => {
      if (!chatLoading.value && !sendingMessage.value) fetchMessages()
    }, 4000)
  } else {
    selectedMeetup.value = null
    messages.value = []
    newMessage.value = ''
    chatError.value = ''
    sendError.value = ''
    hasLoadedMessages.value = false
  }
})

onUnmounted(() => {
  if (chatPollTimer) {
    clearInterval(chatPollTimer)
    chatPollTimer = null
  }
})

useSeoMeta({ title: 'Chats – Eldoret Hot' })
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
