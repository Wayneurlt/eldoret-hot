import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isModel: (state) => state.user?.role === 'model',
    isClient: (state) => state.user?.role === 'client',
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    setAuth(user: User, token: string) {
      this.user = user
      this.token = token
      if (import.meta.client) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(user))
      }
    },

    logout() {
      this.user = null
      this.token = null
      if (import.meta.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    },

    loadFromStorage() {
      if (import.meta.client) {
        const token = localStorage.getItem('auth_token')
        const userStr = localStorage.getItem('auth_user')
        if (token && userStr) {
          try {
            this.token = token
            this.user = JSON.parse(userStr)
          } catch {
            this.logout()
          }
        }
      }
    },

    async fetchMe() {
      if (!this.token) return
      try {
        const data = await $fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${this.token}` },
        }) as any
        if (data.success) {
          this.user = data.data
        }
      } catch {
        this.logout()
      }
    },
  },
})
