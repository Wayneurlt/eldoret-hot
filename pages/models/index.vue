<template>
  <div class="py-10">
    <div class="page-container">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="section-title mb-2">Discover Talent</h1>
        <p class="text-gray-400">Browse Eldoret's top models, influencers, and brand ambassadors</p>
      </div>

      <!-- Filters -->
      <div class="glass-card p-4 mb-8">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search -->
          <div class="relative flex-1">
            <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search by name, location, or keywords..."
              class="input-field pl-9"
              @input="debouncedSearch"
            />
          </div>

          <!-- Category -->
          <select v-model="filters.category" @change="fetchModels" class="input-field md:w-52">
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>

          <!-- Availability -->
          <select v-model="filters.availability" @change="fetchModels" class="input-field md:w-44">
            <option value="">Any Availability</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
          </select>
        </div>
      </div>

      <!-- Results count -->
      <div class="flex items-center justify-between mb-6">
        <p class="text-gray-400 text-sm">
          <span class="text-white font-semibold">{{ meta.total || 0 }}</span> model{{ meta.total !== 1 ? 's' : '' }} found
        </p>
        <div class="flex items-center gap-2">
          <button
            v-for="v in ['grid', 'list']" :key="v"
            @click="viewMode = v as any"
            :class="viewMode === v ? 'text-white bg-gray-800' : 'text-gray-500 hover:text-gray-300'"
            class="p-2 rounded-lg transition-colors"
          >
            <Icon :name="v === 'grid' ? 'lucide:layout-grid' : 'lucide:list'" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="n in 8" :key="n" class="card animate-pulse">
          <div class="h-64 bg-gray-800"></div>
          <div class="p-4 space-y-3">
            <div class="h-4 bg-gray-800 rounded w-2/3"></div>
            <div class="h-3 bg-gray-800 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- Models grid -->
      <div v-else-if="models.length" :class="viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'">
        <ModelCard v-for="model in models" :key="model.id" :model="model" />
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-24">
        <Icon name="lucide:search-x" class="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <h3 class="text-xl font-display font-bold text-gray-300 mb-2">No models found</h3>
        <p class="text-gray-500 mb-6">Try adjusting your search or filters</p>
        <button @click="clearFilters" class="btn-outline">Clear Filters</button>
      </div>

      <!-- Pagination -->
      <div v-if="meta.pages > 1" class="flex items-center justify-center gap-2 mt-12">
        <button
          @click="changePage(meta.page - 1)"
          :disabled="meta.page <= 1"
          class="w-10 h-10 rounded-lg border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="lucide:chevron-left" class="w-4 h-4" />
        </button>

        <button
          v-for="p in visiblePages" :key="p"
          @click="changePage(p)"
          :class="p === meta.page ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'"
          class="w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-medium transition-colors"
        >
          {{ p }}
        </button>

        <button
          @click="changePage(meta.page + 1)"
          :disabled="meta.page >= meta.pages"
          class="w-10 h-10 rounded-lg border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="lucide:chevron-right" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ModelProfile } from '~/types'
import { MODEL_CATEGORIES } from '~/types'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const models = ref<ModelProfile[]>([])
const meta = ref({ total: 0, page: 1, limit: 12, pages: 0 })
const viewMode = ref<'grid' | 'list'>('grid')
const categories = MODEL_CATEGORIES

const filters = reactive({
  search: (route.query.search as string) || '',
  category: (route.query.category as string) || '',
  availability: (route.query.availability as string) || '',
  page: Number(route.query.page) || 1,
})

async function fetchModels() {
  loading.value = true
  try {
    const res = await $fetch<any>('/api/models', {
      query: {
        search: filters.search || undefined,
        category: filters.category || undefined,
        availability: filters.availability || undefined,
        page: filters.page,
        limit: 12,
      },
    })
    models.value = res.data || []
    meta.value = res.meta || { total: 0, page: 1, limit: 12, pages: 0 }
  } finally {
    loading.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout>
function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    filters.page = 1
    fetchModels()
  }, 400)
}

function clearFilters() {
  filters.search = ''
  filters.category = ''
  filters.availability = ''
  filters.page = 1
  fetchModels()
}

function changePage(p: number) {
  filters.page = p
  fetchModels()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const visiblePages = computed(() => {
  const pages = []
  const { page, pages: total } = meta.value
  const start = Math.max(1, page - 2)
  const end = Math.min(total, page + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

await fetchModels()

useSeoMeta({ title: 'Browse Models – Eldoret Hot' })
</script>
