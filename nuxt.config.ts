export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2024-11-01',

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/icon',
  ],

  icon: {
    provider: 'iconify',
    serverBundle: false,
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'eldoret-hot-secret-key-2024',
    dbPath: process.env.DB_PATH || './eldoret-hot.db',
    databaseUrl: process.env.DATABASE_URL || '',
    public: {
      appName: 'Eldoret Hot',
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js',
  },

  nitro: {
    experimental: {
      database: false,
    },
  },

  typescript: {
    strict: false,
  },
})
