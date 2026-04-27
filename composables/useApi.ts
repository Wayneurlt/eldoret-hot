export function useApi() {
  const authStore = useAuthStore()

  const authHeaders = computed(() => ({
    Authorization: authStore.token ? `Bearer ${authStore.token}` : '',
  }))

  async function apiFetch<T = any>(url: string, options?: RequestInit & { params?: Record<string, any> }): Promise<T> {
    const { params, ...fetchOptions } = options || {}
    let fullUrl = url
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') searchParams.append(k, String(v))
      })
      const qs = searchParams.toString()
      if (qs) fullUrl = `${url}?${qs}`
    }

    return $fetch<T>(fullUrl, {
      ...fetchOptions,
      headers: {
        ...authHeaders.value,
        ...(fetchOptions.headers as Record<string, string> || {}),
      },
    })
  }

  return { apiFetch, authHeaders }
}
