import { defineStore } from 'pinia'
import { ref } from 'vue'

import { api } from '@/api.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  async function fetchCurrentUser() {
    try {
      const data = await api.get('/users/me')
      user.value = data.user
    } catch {
      user.value = null
    }
  }

  async function login(email, password) {
    await api.post('/auth/login', { email, password })
    await fetchCurrentUser()
  }

  async function register(email, password, username) {
    return await api.post('/auth/register', { email, password, username })
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore errors — on déconnecte quoi qu'il arrive
    }
    user.value = null
  }

  return { user, login, register, logout, fetchCurrentUser }
})
