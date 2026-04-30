<template>
  <div class="overflow-x-hidden" style="background:#0d0015;">

    <!-- ═══════════════════════════════════════════
         HERO SECTION
    ═══════════════════════════════════════════ -->
    <section class="relative min-h-screen flex flex-col overflow-hidden">

      <!-- Ambient background glow -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="orb-pink w-[700px] h-[700px] -top-40 -left-20"></div>
        <div class="orb-purple w-[600px] h-[600px] top-1/3 right-0"></div>
        <div class="orb-pink w-[400px] h-[400px] bottom-0 left-1/3"></div>
      </div>

      <!-- Top navigation overlay -->
      <div class="relative z-10 flex-1 flex flex-col">
        <!-- Hero text content -->
        <div class="relative z-10 page-container pt-24 pb-10 text-center flex flex-col items-center">

          <!-- Pill badge -->
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/40 bg-brand-500/10 backdrop-blur-sm text-brand-300 text-sm font-medium mb-8 animate-float">
            <span class="w-2 h-2 rounded-full bg-brand-400 animate-ping"></span>
            Eldoret's #1 Talent Discovery Platform
          </div>

          <!-- Main heading -->
          <h1 class="font-display font-black text-6xl md:text-8xl lg:text-9xl leading-none mb-6">
            <span class="block text-white">ELDORET</span>
            <span class="block gradient-text italic">HOT</span>
          </h1>

          <p class="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Discover Eldoret's finest models, influencers & brand ambassadors.
            Connect. Collab. Create.
          </p>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row gap-4 mb-16">
            <NuxtLink to="/models" class="btn-primary text-base px-8 py-4 flex items-center gap-2 group">
              <Icon name="lucide:flame" class="w-5 h-5 group-hover:scale-125 transition-transform" />
              Browse All Models
            </NuxtLink>
            <NuxtLink to="/register?role=model" class="btn-glass text-base px-8 py-4 flex items-center gap-2">
              <Icon name="lucide:sparkles" class="w-5 h-5 text-brand-400" />
              Join as Model
            </NuxtLink>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════
             SCROLLING PHOTO ROWS
        ═══════════════════════════════════════════ -->
        <div class="relative w-full py-2">
          <!-- Edge fades — keep only side fades for clarity -->
          <div class="absolute top-0 left-0 bottom-0 w-40 z-20 pointer-events-none" style="background:linear-gradient(to right,#0d0015,transparent)"></div>
          <div class="absolute top-0 right-0 bottom-0 w-40 z-20 pointer-events-none" style="background:linear-gradient(to left,#0d0015,transparent)"></div>

          <!-- ── Row 1 — RIGHT → LEFT ── -->
          <!--
            overflow-x:clip  clips the scrolling content horizontally (no scrollbar, no BFC)
            overflow-y:visible  lets the scaled card pop OUT above/below the row
            padding-block gives vertical room for the expanded card
          -->
          <div
            style="overflow-x:clip; overflow-y:visible; width:100%; padding:20px 0; position:relative;"
            @mouseenter="pauseRow1 = true"
            @mouseleave="pauseRow1 = false"
          >
            <div
              class="marquee-track"
              :style="{ animation:'marquee-left 35s linear infinite', animationPlayState: pauseRow1 ? 'paused' : 'running' }"
            >
              <ModelPhotoCard v-for="(m, i) in [...fullRow1, ...fullRow1]" :key="`r1-${i}`" :model="m" @open="openSpotlight" />
            </div>
          </div>

          <!-- ── Row 2 — LEFT → RIGHT ── -->
          <div
            style="overflow-x:clip; overflow-y:visible; width:100%; padding:20px 0; position:relative;"
            @mouseenter="pauseRow2 = true"
            @mouseleave="pauseRow2 = false"
          >
            <div
              class="marquee-track"
              :style="{ animation:'marquee-right 35s linear infinite', animationPlayState: pauseRow2 ? 'paused' : 'running' }"
            >
              <ModelPhotoCard v-for="(m, i) in [...fullRow2, ...fullRow2]" :key="`r2-${i}`" :model="m" @open="openSpotlight" />
            </div>
          </div>

          <!-- ── Row 3 — RIGHT → LEFT ── -->
          <div
            style="overflow-x:clip; overflow-y:visible; width:100%; padding:20px 0; position:relative;"
            @mouseenter="pauseRow3 = true"
            @mouseleave="pauseRow3 = false"
          >
            <div
              class="marquee-track"
              :style="{ animation:'marquee-left 35s linear infinite', animationPlayState: pauseRow3 ? 'paused' : 'running' }"
            >
              <ModelPhotoCard v-for="(m, i) in [...fullRow3, ...fullRow3]" :key="`r3-${i}`" :model="m" @open="openSpotlight" />
            </div>
          </div>
        </div>

        <!-- Stats bar -->
        <div class="relative z-10 page-container py-12">
          <div class="glass flex flex-wrap items-center justify-around gap-6 px-8 py-6">
            <div v-for="stat in stats" :key="stat.label" class="text-center">
              <p class="font-display font-black text-4xl gradient-text">{{ stat.value }}</p>
              <p class="text-white/40 text-sm mt-1">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         FEATURED MODELS GRID
    ═══════════════════════════════════════════ -->
    <section class="py-24 relative">
      <div class="orb-pink w-[500px] h-[500px] top-0 right-0 opacity-10"></div>
      <div class="page-container relative z-10">
        <div class="flex items-end justify-between mb-12">
          <div>
            <p class="text-brand-400 text-sm font-semibold uppercase tracking-[0.2em] mb-3">🔥 Top Picks</p>
            <h2 class="section-title text-4xl md:text-5xl">
              Featured <span class="gradient-text italic">Models</span>
            </h2>
          </div>
          <NuxtLink to="/models" class="hidden sm:flex btn-outline items-center gap-2 text-sm">
            View All <Icon name="lucide:arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>

        <!-- Loading skeleton -->
        <div v-if="pending" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          <div v-for="n in 8" :key="n" class="rounded-2xl overflow-hidden animate-pulse" style="aspect-ratio:2/3;background:rgba(255,255,255,0.05)"></div>
        </div>

        <!-- Model cards grid -->
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          <NuxtLink
            v-for="model in featuredModels"
            :key="model.id"
            :to="`/models/${model.id}`"
            class="group relative overflow-hidden rounded-2xl cursor-pointer"
            style="aspect-ratio:2/3;"
          >
            <img
              :src="model.avatar || getUnsplashUrl(model.name, model.id)"
              :alt="model.name"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <!-- Gradient overlay -->
            <div class="absolute inset-0 transition-opacity duration-300" style="background:linear-gradient(to top, rgba(13,0,21,0.98) 0%, rgba(13,0,21,0.5) 40%, transparent 70%)"></div>
            <!-- Hover glow border -->
            <div class="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-brand-500/60 transition-all duration-300"></div>

            <!-- Info -->
            <div class="absolute bottom-0 left-0 right-0 p-5 z-10">
              <div v-if="model.featured" class="badge-pink text-xs mb-2 inline-flex">
                <Icon name="lucide:star" class="w-3 h-3" /> Featured
              </div>
              <h3 class="font-display font-bold text-white text-lg leading-tight">{{ model.name }}</h3>
              <div class="flex items-center justify-between mt-2">
                <span class="text-white/50 text-xs flex items-center gap-1">
                  <Icon name="lucide:map-pin" class="w-3 h-3" />
                  {{ model.location || 'Eldoret' }}
                </span>
                <span class="badge-pink text-xs">{{ model.category }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Empty state fallback with demo cards -->
        <div v-if="!pending && !featuredModels.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          <NuxtLink
            v-for="demo in demoModels"
            :key="demo.id"
            to="/register"
            class="group relative overflow-hidden rounded-2xl cursor-pointer"
            style="aspect-ratio:2/3;"
          >
            <img :src="demo.img" :alt="demo.name" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div class="absolute inset-0" style="background:linear-gradient(to top, rgba(13,0,21,0.98) 0%, rgba(13,0,21,0.4) 40%, transparent 70%)"></div>
            <div class="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-brand-500/60 transition-all duration-300"></div>
            <div class="absolute bottom-0 left-0 right-0 p-5">
              <h3 class="font-display font-bold text-white text-lg">{{ demo.name }}</h3>
              <div class="flex items-center justify-between mt-2">
                <span class="text-white/50 text-xs">Eldoret, Kenya</span>
                <span class="badge-pink text-xs">{{ demo.category }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <div class="text-center mt-10 sm:hidden">
          <NuxtLink to="/models" class="btn-outline inline-flex items-center gap-2">
            View All Models <Icon name="lucide:arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         HOW IT WORKS
    ═══════════════════════════════════════════ -->
    <section class="py-24 relative overflow-hidden">
      <div class="absolute inset-0" style="background:linear-gradient(180deg, transparent 0%, rgba(114,9,183,0.08) 50%, transparent 100%)"></div>
      <div class="page-container relative z-10">
        <div class="text-center mb-16">
          <p class="text-brand-400 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Simple Process</p>
          <h2 class="section-title text-4xl md:text-5xl">
            How <span class="gradient-text italic">It Works</span>
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <!-- Connecting line -->
          <div class="hidden md:block absolute top-16 left-1/4 right-1/4 h-px" style="background:linear-gradient(to right, transparent, rgba(247,37,133,0.4), transparent)"></div>

          <div v-for="(step, i) in steps" :key="i" class="glass-card p-8 text-center group relative">
            <div class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style="background:linear-gradient(135deg, rgba(247,37,133,0.05) 0%, rgba(114,9,183,0.05) 100%)"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center relative" style="background:linear-gradient(135deg, rgba(247,37,133,0.15), rgba(114,9,183,0.15)); border:1px solid rgba(247,37,133,0.2)">
                <Icon :name="step.icon" class="w-8 h-8 text-brand-400" />
                <div class="absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white" style="background:linear-gradient(135deg, #f72585, #7209b7)">
                  {{ i + 1 }}
                </div>
              </div>
              <h3 class="font-display font-bold text-xl text-white mb-3">{{ step.title }}</h3>
              <p class="text-white/50 text-sm leading-relaxed">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         CATEGORIES
    ═══════════════════════════════════════════ -->
    <section class="py-24 relative">
      <div class="page-container relative z-10">
        <div class="text-center mb-12">
          <p class="text-brand-400 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Explore</p>
          <h2 class="section-title text-4xl md:text-5xl">
            Browse <span class="gradient-text italic">Categories</span>
          </h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.name"
            :to="`/models?category=${cat.name}`"
            class="group glass-card p-5 text-center hover:border-brand-500/40 transition-all duration-300 relative overflow-hidden"
          >
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style="background:linear-gradient(135deg, rgba(247,37,133,0.08), rgba(114,9,183,0.08))"></div>
            <Icon :name="cat.icon" class="w-9 h-9 text-brand-400 mx-auto mb-3 group-hover:scale-110 group-hover:text-brand-300 transition-all duration-300" />
            <p class="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{{ cat.name }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         CTA BANNER
    ═══════════════════════════════════════════ -->
    <section class="py-24 relative overflow-hidden">
      <div class="absolute inset-0" style="background:linear-gradient(135deg, rgba(247,37,133,0.15) 0%, rgba(114,9,183,0.2) 50%, rgba(247,37,133,0.1) 100%)"></div>
      <div class="absolute inset-0 border-y" style="border-color: rgba(247,37,133,0.15)"></div>

      <!-- Decorative circles -->
      <div class="absolute -right-20 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full border" style="border-color:rgba(247,37,133,0.1)"></div>
      <div class="absolute -right-10 top-1/2 -translate-y-1/2 w-52 h-52 rounded-full border" style="border-color:rgba(247,37,133,0.15)"></div>
      <div class="absolute -left-20 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full border" style="border-color:rgba(114,9,183,0.1)"></div>

      <div class="page-container relative z-10 text-center">
        <p class="text-brand-400 text-sm font-semibold uppercase tracking-[0.2em] mb-4">Join Today</p>
        <h2 class="font-display font-black text-5xl md:text-7xl text-white mb-6 leading-tight">
          Ready to Get<br/>
          <span class="gradient-text italic">Discovered?</span>
        </h2>
        <p class="text-white/50 text-lg mb-10 max-w-xl mx-auto">
          Whether you're a model looking for brand deals or a business searching for authentic local voices — your next opportunity starts here.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink to="/register?role=client" class="btn-primary text-base px-10 py-4 flex items-center gap-2">
            <Icon name="lucide:building-2" class="w-5 h-5" />
            I'm a Brand / Client
          </NuxtLink>
          <NuxtLink to="/register?role=model" class="btn-glass text-base px-10 py-4 flex items-center gap-2">
            <Icon name="lucide:sparkles" class="w-5 h-5 text-brand-400" />
            I'm a Model / Influencer
          </NuxtLink>
        </div>
      </div>
    </section>

    <ModelSpotlightModal
      v-model="spotlightOpen"
      :model="selectedSpotlight"
    />
  </div>
</template>

<script setup lang="ts">
import type { ModelProfile } from '~/types'

const pauseRow1 = ref(false)
const pauseRow2 = ref(false)
const pauseRow3 = ref(false)
const spotlightOpen = ref(false)
const selectedSpotlight = ref<any>(null)

// Fetch featured models
const { data, pending } = await useFetch<any>('/api/models', {
  query: { featured: 'true', limit: 8 },
})
const featuredModels = computed<ModelProfile[]>(() => data.value?.data || [])

// Helper: generate a deterministic Unsplash fashion photo based on id
function getUnsplashUrl(name?: string, id?: number) {
  const fashionIds = [
    '1529626426572-a9f2d4e8e2f0','1515886657613-9f3515b0c78f','1524502397800-2ece9d3b981d',
    '1488426862026-3ee34a7d66df','1469334031218-e382a71b716b','1534528741775-53994a69daeb',
    '1531746020798-e6953c6e8e04','1558618666-fcd25c85cd64','1508214751196-bcfd4ca60f91',
    '1509631179647-0177331693ae',
  ]
  const idx = (id || 0) % fashionIds.length
  return `https://images.unsplash.com/photo-${fashionIds[idx]}?w=400&h=600&fit=crop&q=80`
}

// Demo models (shown when DB is empty)
const demoModels = [
  { id: 1, name: 'Amara Njeri', category: 'Fashion', img: 'https://images.unsplash.com/photo-1529626426572-a9f2d4e8e2f0?w=400&h=600&fit=crop&q=80' },
  { id: 2, name: 'Zara Wangari', category: 'Beauty', img: 'https://images.unsplash.com/photo-1524502397800-2ece9d3b981d?w=400&h=600&fit=crop&q=80' },
  { id: 3, name: 'Stella Achieng', category: 'Lifestyle', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&q=80' },
  { id: 4, name: 'Kezia Moraa', category: 'Fitness', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop&q=80' },
  { id: 5, name: 'Naomi Chebet', category: 'Travel', img: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&q=80' },
  { id: 6, name: 'Fatuma Kioni', category: 'Fashion', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop&q=80' },
  { id: 7, name: 'Grace Wambui', category: 'Entertainment', img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop&q=80' },
  { id: 8, name: 'Diana Otieno', category: 'Beauty', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop&q=80' },
]

// All scroll photos — 18 unique Unsplash fashion shots
const allScrollPhotos = [
  { name: 'Amara N.',   img: 'https://images.unsplash.com/photo-1529626426572-a9f2d4e8e2f0?w=440&h=580&fit=crop&q=85', cat: 'Fashion', location: 'Eldoret CBD', bio: 'Runway and editorial model with premium campaign experience.', gallery: ['https://images.unsplash.com/photo-1529626426572-a9f2d4e8e2f0?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&h=1200&fit=crop&q=85'] },
  { name: 'Zara W.',    img: 'https://images.unsplash.com/photo-1524502397800-2ece9d3b981d?w=440&h=580&fit=crop&q=85', cat: 'Beauty', location: 'Pioneer', bio: 'Beauty creator focused on makeup tutorials and product campaigns.', gallery: ['https://images.unsplash.com/photo-1524502397800-2ece9d3b981d?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=1200&fit=crop&q=85'] },
  { name: 'Stella A.',  img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=440&h=580&fit=crop&q=85', cat: 'Lifestyle', location: 'Kapsoya', bio: 'Lifestyle and family-oriented content creator with high trust audience.', gallery: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1519011985187-444d62641929?w=900&h=1200&fit=crop&q=85'] },
  { name: 'Kezia M.',   img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=440&h=580&fit=crop&q=85', cat: 'Fitness', location: 'Elgon View', bio: 'Fitness ambassador for activewear and wellness product launches.', gallery: ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1484863137850-59afcfe05386?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=900&h=1200&fit=crop&q=85'] },
  { name: 'Naomi C.',   img: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=440&h=580&fit=crop&q=85', cat: 'Travel', location: 'Langas', bio: 'Travel storyteller with strong destination and hospitality collaborations.', gallery: ['https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1500336624523-d727130c3328?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&h=1200&fit=crop&q=85'] },
  { name: 'Fatuma K.',  img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=440&h=580&fit=crop&q=85', cat: 'Fashion', location: 'West Indies', bio: 'Streetwear and luxury style model for boutique campaigns.', gallery: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1496440737103-cd596325d314?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=900&h=1200&fit=crop&q=85'] },
  { name: 'Grace W.',   img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=440&h=580&fit=crop&q=85', cat: 'Entertainment', location: 'Kimumu', bio: 'Entertainment host and influencer with highly engaging short-form content.', gallery: ['https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1516914943479-89db7d9ae7f2?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=1200&fit=crop&q=85'] },
  { name: 'Diana O.',   img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=440&h=580&fit=crop&q=85', cat: 'Beauty', location: 'Huruma', bio: 'Beauty brand collaborator with standout portrait and product content.', gallery: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1524502397800-2ece9d3b981d?w=900&h=1200&fit=crop&q=85'] },
  { name: 'Lydia K.',   img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=440&h=580&fit=crop&q=85', cat: 'Fashion', location: 'Pioneer', bio: 'Editorial-style model for catalog and social campaign shoots.', gallery: ['https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1529626426572-a9f2d4e8e2f0?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1200&fit=crop&q=85'] },
  { name: 'Sandra L.',  img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=440&h=580&fit=crop&q=85', cat: 'Influencer', location: 'Kapsoya', bio: 'Micro-influencer with strong conversion rates for product launches.', gallery: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1500336624523-d727130c3328?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900&h=1200&fit=crop&q=85'] },
  { name: 'Mercy T.',   img: 'https://images.unsplash.com/photo-1484863137850-59afcfe05386?w=440&h=580&fit=crop&q=85', cat: 'Fitness', location: 'Elgon View', bio: 'Fitness coach creator ideal for nutrition and active lifestyle brands.', gallery: ['https://images.unsplash.com/photo-1484863137850-59afcfe05386?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=1200&fit=crop&q=85'] },
  { name: 'Ruth N.',    img: 'https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=440&h=580&fit=crop&q=85', cat: 'Beauty', location: 'CBD', bio: 'Beauty and skincare storyteller trusted by urban young professionals.', gallery: ['https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=1200&fit=crop&q=85'] },
  { name: 'Cynthia A.', img: 'https://images.unsplash.com/photo-1496440737103-cd596325d314?w=440&h=580&fit=crop&q=85', cat: 'Fashion', location: 'Langas', bio: 'High-fashion visual creator with premium campaign-ready aesthetic.', gallery: ['https://images.unsplash.com/photo-1496440737103-cd596325d314?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&h=1200&fit=crop&q=85'] },
  { name: 'Ann M.',     img: 'https://images.unsplash.com/photo-1519011985187-444d62641929?w=440&h=580&fit=crop&q=85', cat: 'Lifestyle', location: 'Kimumu', bio: 'Lifestyle model balancing aspirational and relatable storytelling.', gallery: ['https://images.unsplash.com/photo-1519011985187-444d62641929?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1500336624523-d727130c3328?w=900&h=1200&fit=crop&q=85'] },
  { name: 'Joyce B.',   img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=440&h=580&fit=crop&q=85', cat: 'Beauty', location: 'West Indies', bio: 'Makeup and beauty specialist with strong product tutorial performance.', gallery: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1524502397800-2ece9d3b981d?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=900&h=1200&fit=crop&q=85'] },
  { name: 'Pauline W.', img: 'https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=440&h=580&fit=crop&q=85', cat: 'Fashion', location: 'Pioneer', bio: 'Performance-driven model for sportswear and active campaigns.', gallery: ['https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1484863137850-59afcfe05386?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=1200&fit=crop&q=85'] },
  { name: 'Vivian O.',  img: 'https://images.unsplash.com/photo-1516914943479-89db7d9ae7f2?w=440&h=580&fit=crop&q=85', cat: 'Entertainment', location: 'CBD', bio: 'Media personality suited for events, launches, and entertainment brands.', gallery: ['https://images.unsplash.com/photo-1516914943479-89db7d9ae7f2?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&h=1200&fit=crop&q=85'] },
  { name: 'Hanna J.',   img: 'https://images.unsplash.com/photo-1500336624523-d727130c3328?w=440&h=580&fit=crop&q=85', cat: 'Fashion', location: 'Kapsoya', bio: 'Editorial-inspired creator with premium campaign-ready visuals.', gallery: ['https://images.unsplash.com/photo-1500336624523-d727130c3328?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900&h=1200&fit=crop&q=85','https://images.unsplash.com/photo-1519011985187-444d62641929?w=900&h=1200&fit=crop&q=85'] },
]

// Each row uses all 18 photos in a different rotation so rows look distinct
// 18 cards × 236px each ≈ 4248px — fills any screen width with no gaps
const fullRow1 = allScrollPhotos                                      // original order
const fullRow2 = [...allScrollPhotos.slice(6), ...allScrollPhotos.slice(0, 6)]  // starts from #7
const fullRow3 = [...allScrollPhotos.slice(12), ...allScrollPhotos.slice(0, 12)] // starts from #13

function openSpotlight(model: any) {
  selectedSpotlight.value = model
  spotlightOpen.value = true
}

const stats = [
  { value: '500+', label: 'Active Models' },
  { value: '200+', label: 'Brands' },
  { value: '1,200+', label: 'Successful Chats' },
  { value: '98%', label: 'Satisfaction Rate' },
]

const steps = [
  {
    icon: 'lucide:user-circle',
    title: 'Create Your Profile',
    description: 'Models sign up, add stunning photos, list their categories, rates, and social media reach.',
  },
  {
    icon: 'lucide:search',
    title: 'Get Discovered',
    description: 'Clients browse profiles, filter by category, availability, and find their perfect brand voice.',
  },
  {
    icon: 'lucide:handshake',
    title: 'Meet & Collaborate',
    description: 'Start a chat, discuss the project, agree on terms, and start creating together.',
  },
]

const categories = [
  { name: 'Fashion', icon: 'lucide:shirt' },
  { name: 'Fitness & Health', icon: 'lucide:dumbbell' },
  { name: 'Beauty & Makeup', icon: 'lucide:sparkles' },
  { name: 'Lifestyle', icon: 'lucide:sun' },
  { name: 'Food & Cooking', icon: 'lucide:utensils' },
  { name: 'Travel', icon: 'lucide:plane' },
  { name: 'Tech & Gaming', icon: 'lucide:monitor' },
  { name: 'Entertainment', icon: 'lucide:music' },
  { name: 'Sports', icon: 'lucide:trophy' },
  { name: 'Business', icon: 'lucide:briefcase' },
  { name: 'Art & Culture', icon: 'lucide:palette' },
  { name: 'Photography', icon: 'lucide:camera' },
]

useSeoMeta({
  title: 'Eldoret Hot – Discover Models & Influencers',
  description: "Eldoret's #1 platform connecting brands with the hottest models and influencers.",
})
</script>

