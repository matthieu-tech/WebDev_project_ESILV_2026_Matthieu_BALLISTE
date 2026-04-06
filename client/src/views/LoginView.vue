<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/welcome')
  } catch (err) {
    error.value = err.error || 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">CryptoFolio</h1>
      <p class="auth-subtitle">Connectez-vous à votre compte</p>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="votre@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>

      <p class="auth-link">
        Pas encore de compte ?
        <RouterLink to="/register">S'inscrire</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}

.auth-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 400px;
}

.auth-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.25rem;
  text-align: center;
}

.auth-subtitle {
  color: #666;
  text-align: center;
  margin: 0 0 2rem;
  font-size: 0.95rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
}

.form-group input {
  padding: 0.65rem 0.875rem;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
  outline: none;
}

.form-group input:focus {
  border-color: #4f46e5;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin: 0;
}

.btn-primary {
  padding: 0.75rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.25rem;
}

.btn-primary:hover:not(:disabled) {
  background: #4338ca;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-link {
  text-align: center;
  margin: 1.5rem 0 0;
  font-size: 0.9rem;
  color: #666;
}

.auth-link a {
  color: #4f46e5;
  font-weight: 600;
  text-decoration: none;
}

.auth-link a:hover {
  text-decoration: underline;
}
</style>
