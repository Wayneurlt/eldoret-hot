<template>
  <nav class="sticky top-0 z-50 transition-all duration-300" :class="isScrolled ? 'py-2' : 'py-3'">
    <div class="page-container">
      <div class="bar">
        <NuxtLink to="/" class="brand">
          <span class="logo"><Icon name="lucide:flame" class="w-4 h-4 text-white" /></span>
          <span class="text-white font-display font-bold tracking-tight">Eldoret <span class="gradient-text">Hot</span></span>
        </NuxtLink>

        <div class="hidden md:flex items-center gap-1">
          <NuxtLink to="/models" class="link" :class="isActive('/models') && 'link-active'">Models</NuxtLink>
          <NuxtLink v-if="authStore.isAuthenticated" to="/dashboard" class="link" :class="isActive('/dashboard') && 'link-active'">Dashboard</NuxtLink>
          <NuxtLink v-if="authStore.isAuthenticated" to="/meetups" class="link relative" :class="isActive('/meetups') && 'link-active'">
            Meetups
            <span v-if="pendingCount > 0" class="badge-dot">{{ pendingCount }}</span>
          </NuxtLink>
        </div>

        <div class="flex items-center gap-2">
          <template v-if="authStore.isAuthenticated">
            <div class="relative" ref="dropdownRef">
              <button
                @click="dropdownOpen = !dropdownOpen"
                class="account-btn"
                :aria-expanded="dropdownOpen"
                aria-haspopup="menu"
                aria-label="Open account menu"
              >
                <img
                  :src="authStore.user?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(authStore.user?.name || 'U')}&backgroundColor=f72585`"
                  :alt="authStore.user?.name"
                  class="w-8 h-8 rounded-full object-cover border border-white/20"
                />
                <span class="hidden sm:block text-sm text-white/85 font-semibold">{{ authStore.user?.name?.split(' ')[0] }}</span>
                <Icon name="lucide:chevron-down" class="w-4 h-4 text-white/50 transition-transform" :class="dropdownOpen && 'rotate-180'" />
              </button>

              <Transition name="dropdown">
                <div v-if="dropdownOpen" class="menu">
                  <NuxtLink to="/dashboard" @click="dropdownOpen = false" class="menu-row">Dashboard</NuxtLink>
                  <NuxtLink to="/dashboard/profile" @click="dropdownOpen = false" class="menu-row">Edit Profile</NuxtLink>
                  <NuxtLink to="/meetups" @click="dropdownOpen = false" class="menu-row">My Meetups</NuxtLink>
                  <button @click="handleLogout" class="menu-row text-red-300 hover:text-red-200">Sign Out</button>
                </div>
              </Transition>
            </div>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="hidden sm:inline-flex ghost">Sign In</NuxtLink>
            <NuxtLink to="/register" class="btn-primary text-sm px-4 !rounded-lg">Get Started</NuxtLink>
          </template>

          <button
            @click="mobileOpen = !mobileOpen"
            class="md:hidden icon-btn"
            :aria-expanded="mobileOpen"
            aria-label="Toggle mobile menu"
          >
            <Icon :name="mobileOpen ? 'lucide:x' : 'lucide:menu'" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <Transition name="mobile-menu">
        <div v-if="mobileOpen" class="md:hidden mt-2 rounded-2xl border border-white/15 bg-[#130017]/95 backdrop-blur-xl p-2 space-y-1">
          <NuxtLink to="/models" @click="mobileOpen = false" class="mobile-link">Browse Models</NuxtLink>
          <template v-if="authStore.isAuthenticated">
            <NuxtLink to="/dashboard" @click="mobileOpen = false" class="mobile-link">Dashboard</NuxtLink>
            <NuxtLink to="/meetups" @click="mobileOpen = false" class="mobile-link">Meetups</NuxtLink>
            <NuxtLink to="/dashboard/profile" @click="mobileOpen = false" class="mobile-link">Edit Profile</NuxtLink>
            <button @click="handleLogout" class="mobile-link text-red-300">Sign Out</button>
          </template>
          <template v-else>
            <NuxtLink to="/login" @click="mobileOpen = false" class="mobile-link">Sign In</NuxtLink>
            <NuxtLink to="/register" @click="mobileOpen = false" class="mobile-link bg-brand-500/20 text-brand-200">Get Started Free</NuxtLink>
          </template>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { apiFetch } = useApi()
const dropdownOpen = ref(false)
const mobileOpen = ref(false)
const dropdownRef = ref<HTMLElement>()
const pendingCount = ref(0)
const isScrolled = ref(false)

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

function handleLogout() {
  authStore.logout()
  dropdownOpen.value = false
  mobileOpen.value = false
  router.push('/')
}

async function fetchPendingCount() {
  if (!authStore.isAuthenticated) {
    pendingCount.value = 0
    return
  }
  try {
    const res = await apiFetch<any>('/api/meetups')
    pendingCount.value = (res?.data || []).filter((m: any) => m.status === 'pending').length
  } catch {
    pendingCount.value = 0
  }
}

onMounted(async () => {
  if (import.meta.client) {
    const onScroll = () => {
      isScrolled.value = window.scrollY > 6
    }
    const onOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
        dropdownOpen.value = false
      }
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dropdownOpen.value = false
        mobileOpen.value = false
      }
    }
    onScroll()
    document.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('click', onOutsideClick)
    document.addEventListener('keydown', onEsc)

    onUnmounted(() => {
      document.removeEventListener('scroll', onScroll)
      document.removeEventListener('click', onOutsideClick)
      document.removeEventListener('keydown', onEsc)
    })
  }
  await fetchPendingCount()
})

watch(() => router.currentRoute.value.path, async () => {
  mobileOpen.value = false
  dropdownOpen.value = false
  await fetchPendingCount()
})

watch(() => authStore.isAuthenticated, async () => {
  await fetchPendingCount()
})

watch(mobileOpen, (open) => {
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
})

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-8px) scale(0.97); }

.mobile-menu-enter-active, .mobile-menu-leave-active { transition: all 0.2s ease; }
.mobile-menu-enter-from, .mobile-menu-leave-to { opacity: 0; transform: translateY(-10px); }

.bar {
  @apply h-16 rounded-2xl border px-3 sm:px-4 flex items-center justify-between;
  background: rgba(13, 0, 21, 0.88);
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 10px 24px rgba(0,0,0,0.25);
}
.brand { @apply flex items-center gap-2.5; }
.logo {
  @apply w-8 h-8 rounded-lg inline-flex items-center justify-center;
  background: linear-gradient(135deg, #f72585, #7209b7);
}
.link {
  @apply text-sm font-semibold text-white/75 px-3 py-2 rounded-lg transition-colors;
}
.link:hover { @apply text-white; background: rgba(255,255,255,0.08); }
.link-active { @apply text-brand-300; background: rgba(247,37,133,0.16); }
.badge-dot {
  @apply absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center;
  background: #f72585;
}
.account-btn {
  @apply flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors;
  background: rgba(255,255,255,0.05);
}
.account-btn:hover { background: rgba(255,255,255,0.1); }
.menu {
  @apply absolute right-0 mt-2 w-52 rounded-xl border overflow-hidden shadow-xl;
  background: rgba(19,0,23,0.97);
  border-color: rgba(255,255,255,0.14);
  backdrop-filter: blur(14px);
}
.menu-row {
  @apply w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-white transition-colors;
}
.menu-row:hover { background: rgba(255,255,255,0.08); }
.ghost {
  @apply text-sm font-semibold text-white/75 px-3 py-2 rounded-lg transition-colors;
}
.ghost:hover { @apply text-white; background: rgba(255,255,255,0.08); }
.icon-btn {
  @apply w-10 h-10 rounded-lg flex items-center justify-center text-white/80 hover:text-white transition-colors;
  background: rgba(255,255,255,0.06);
}
.icon-btn:hover { background: rgba(255,255,255,0.11); }
.mobile-link {
  @apply w-full block text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-white/85 transition-colors;
}
.mobile-link:hover { @apply text-white; background: rgba(255,255,255,0.08); }
</style>
