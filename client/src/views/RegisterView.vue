<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()

const email = ref('')
const username = ref('')
const password = ref('')
const error = ref('')
const success = ref('')
const verificationUrl = ref('')
const loading = ref(false)

async function handleRegister() {
  error.value = ''
  success.value = ''
  verificationUrl.value = ''
  loading.value = true
  try {
    const data = await authStore.register(email.value, password.value, username.value)
    success.value = 'Compte créé ! Vérifiez votre email pour activer votre compte.'
    if (data?.verificationUrl) {
      verificationUrl.value = data.verificationUrl
    }
  } catch (err) {
    error.value = err.error || 'Une erreur est survenue'
    if (err.verificationUrl) {
      verificationUrl.value = err.verificationUrl
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">CryptoFolio</h1>
      <p class="auth-subtitle">Créez votre compte</p>

      <form @submit.prevent="handleRegister" class="auth-form">
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
          <label for="username">Nom d'utilisateur</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="satoshi"
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
        <p v-if="success" class="success-message">{{ success }}</p>
        <p v-if="verificationUrl" class="dev-notice">
          (Dev) Lien de vérification :
          <a :href="verificationUrl" target="_blank">Vérifier mon email</a>
        </p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Création...' : 'Créer mon compte' }}
        </button>
      </form>

      <p class="auth-link">
        Déjà un compte ?
        <RouterLink to="/login">Se connecter</RouterLink>
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

.success-message {
  color: #16a34a;
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

.dev-notice {
  font-size: 0.8rem;
  color: #888;
  margin: 0;
  padding: 0.5rem 0.75rem;
  background: #f8f8f8;
  border-radius: 6px;
  border-left: 3px solid #f59e0b;
}

.dev-notice a {
  color: #4f46e5;
  font-weight: 600;
}
</style>
