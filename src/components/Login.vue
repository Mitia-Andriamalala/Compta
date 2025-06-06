<script setup>
import BaseButton from './atome/BaseButton.vue'
import BaseInput from './atome/BaseInput.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import axios from "axios"

const username = ref('')
const password = ref('')
const usernameError = ref('')
const passwordError = ref('')
const message = ref('')
const success = ref(false)
const isLoading = ref(false)
const router = useRouter()

async function handleLogin() {
  // Reset errors
  usernameError.value = ''
  passwordError.value = ''
  message.value = ''
  
  // Validation
  if (!username.value) {
    usernameError.value = 'Le nom d\'utilisateur est requis'
    return
  }
  if (!password.value) {
    passwordError.value = 'Le mot de passe est requis'
    return
  }

  isLoading.value = true

  console.log('Valeurs avant envoi:', {
    userName: username.value,
    password: password.value,
    parameters:{
        "clientId":11,
        "roleId":102,
        "organizationId":11,
        "warehouseId":103,
        "language":"en_US"
    }
  })

  try {
    const response = await axios.post('/api/v1/auth/tokens', {
      userName: username.value,
      password: password.value,
      parameters:{
          "clientId":11,
          "roleId":102,
          "organizationId":11,
          "warehouseId":103,
          "language":"en_US"
      }
    })

    if (response.status === 200) {
      success.value = true
      message.value = "Connexion réussie!"
      const token = response.data.token
      sessionStorage.setItem('authToken', token)
      console.log("Token:", response.data.token)
      
      setTimeout(() => {
        router.push('/import')
      }, 1500)
    }
  } catch (error) {
    success.value = false
    if (error.response) {
      message.value = "Échec: " + error.response.data.message
    } else {
      message.value = "Erreur réseau: " + error.message
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <!-- Background decorative elements -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
    
    <div class="login-card">
      <!-- Header section -->
      <div class="header-section">
        <div class="logo-container">
          <div class="logo-icon">
            <i class="fas fa-book-open"></i>
          </div>
        </div>
        <h1 class="app-title">ComptaVision</h1>
        <p class="app-subtitle">Connectez-vous à votre espace</p>
      </div>

      <!-- Form section -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label for="username" class="input-label">
            <i class="fas fa-user"></i>
            Nom d'utilisateur
          </label>
          <BaseInput
            id="username"
            v-model="username"
            :error="usernameError"
            placeholder="Entrez votre nom d'utilisateur"
            class="form-input"
          />
        </div>

        <div class="input-group">
          <label for="password" class="input-label">
            <i class="fas fa-lock"></i>
            Mot de passe
          </label>
          <BaseInput
            id="password"
            type="password"
            v-model="password"
            :error="passwordError"
            placeholder="Entrez votre mot de passe"
            class="form-input"
          />
        </div>

        <BaseButton 
          variant="primary" 
          type="submit" 
          :disabled="isLoading"
          class="login-button"
        >
          <span v-if="!isLoading" class="button-content">
            <i class="fas fa-sign-in-alt"></i>
            Se connecter
          </span>
          <span v-else class="button-content">
            <i class="fas fa-spinner fa-spin"></i>
            Connexion...
          </span>
        </BaseButton>

        <!-- Message display -->
        <Transition name="message">
          <div v-if="message" :class="['message', { 'message-success': success, 'message-error': !success }]">
            <i :class="success ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'"></i>
            {{ message }}
          </div>
        </Transition>
      </form>

      <!-- Footer -->
      <div class="footer-section">
        <div class="divider"></div>
        <p class="footer-text">
          <i class="fas fa-shield-alt"></i>
          Connexion sécurisée
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

:root {
  --primary-color: #3b82f6;
  --primary-dark: #2563eb;
  --primary-light: #60a5fa;
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --card-background: rgba(255, 255, 255, 0.95);
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-light: #9ca3af;
  --border-color: #e5e7eb;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --border-radius: 0.75rem;
  --border-radius-lg: 1rem;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 20%;
  animation-delay: 2s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.login-card {
  background: var(--card-background);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 420px;
  position: relative;
  animation: slideUp 0.8s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-section {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border-radius: 50%;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-md);
  transition: var(--transition);
}

.logo-container:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-lg);
}

.logo-icon {
  color: white;
  font-size: 1.5rem;
}

.app-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  letter-spacing: -0.025em;
}

.app-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 400;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.input-label i {
  color: var(--text-secondary);
  width: 1rem;
}

.form-input {
  transition: var(--transition);
}

.login-button {
  margin-top: 0.5rem;
  height: 3rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border: none;
  border-radius: var(--border-radius);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.login-button:active {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

.message-success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.message-error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.footer-section {
  margin-top: 2rem;
  text-align: center;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-color), transparent);
  margin-bottom: 1rem;
}

.footer-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text-light);
  font-size: 0.8rem;
}

/* Transitions */
.message-enter-active, .message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from, .message-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }

  .app-title {
    font-size: 1.75rem;
  }

  .logo-container {
    width: 3.5rem;
    height: 3.5rem;
  }

  .logo-icon {
    font-size: 1.25rem;
  }
}

@media (max-width: 360px) {
  .login-card {
    padding: 1.5rem 1rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --card-background: rgba(17, 24, 39, 0.95);
    --text-primary: #f9fafb;
    --text-secondary: #d1d5db;
    --text-light: #9ca3af;
    --border-color: #374151;
  }
}
</style>