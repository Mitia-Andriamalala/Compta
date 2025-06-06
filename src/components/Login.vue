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
  <div class="page-container">
    <!-- Header Section avec même style que les autres pages -->
    <div class="header-section">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo-icon">
            📊
          </div>
          <div class="brand-info">
            <h1 class="app-title">ComptaVision</h1>
            <p class="app-subtitle">Votre solution de gestion comptable</p>
          </div>
        </div>
        <div class="welcome-message">
          <h2 class="welcome-title">Bienvenue</h2>
          <p class="welcome-subtitle">Connectez-vous pour accéder à votre tableau de bord</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="login-section">
        <div class="login-card">
          <!-- Form Header -->
          <div class="form-header">
            <div class="form-icon">
              🔐
            </div>
            <h3 class="form-title">Connexion</h3>
            <p class="form-subtitle">Saisissez vos identifiants pour continuer</p>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="login-form">
            <div class="input-group">
              <label for="username" class="input-label">
                <span class="label-icon">👤</span>
                Nom d'utilisateur
              </label>
              <div class="input-container">
                <input
                  :id="id"
                  v-model="username"
                  type="text"
                  placeholder="Entrez votre nom d'utilisateur"
                  class="custom-input"
                  :class="{ 'input-error': usernameError }"
                />
                <div v-if="usernameError" class="error-message">{{ usernameError }}</div>
              </div>
            </div>

            <div class="input-group">
              <label for="password" class="input-label">
                <span class="label-icon">🔒</span>
                Mot de passe
              </label>
              <div class="input-container">
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  placeholder="Entrez votre mot de passe"
                  class="custom-input"
                  :class="{ 'input-error': passwordError }"
                />
                <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
              </div>
            </div>

            <button 
              type="submit" 
              :disabled="isLoading"
              class="login-button"
            >
              <span v-if="!isLoading" class="button-content">
                <span class="button-icon">🚀</span>
                Se connecter
              </span>
              <span v-else class="button-content">
                <span class="button-icon spinning">⟳</span>
                Connexion...
              </span>
            </button>

            <!-- Message display -->
            <Transition name="message">
              <div v-if="message" :class="['message', { 'message-success': success, 'message-error': !success }]">
                <span class="message-icon">{{ success ? '✅' : '⚠️' }}</span>
                {{ message }}
              </div>
            </Transition>
          </form>

          <!-- Security Notice -->
          <div class="security-notice">
            <span class="security-icon">🛡️</span>
            <span class="security-text">Connexion sécurisée SSL</span>
          </div>
        </div>

        <!-- Feature Cards -->
        <div class="features-section">
          <div class="feature-card">
            <div class="feature-icon">📈</div>
            <h4 class="feature-title">Tableaux de bord</h4>
            <p class="feature-description">Visualisez vos données financières en temps réel</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h4 class="feature-title">Gestion des comptes</h4>
            <p class="feature-description">Organisez et consultez tous vos comptes</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📤</div>
            <h4 class="feature-title">Import/Export</h4>
            <p class="feature-description">Importez et exportez vos données facilement</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header Section - Même style que les autres pages */
.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 0 2rem 0;
  position: relative;
  overflow: hidden;
}

.header-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx="50%" cy="0%" r="100%"><stop offset="0%" style="stop-color:rgb(255,255,255);stop-opacity:0.1" /><stop offset="100%" style="stop-color:rgb(255,255,255);stop-opacity:0" /></radialGradient></defs><rect width="100" height="20" fill="url(%23a)" /></svg>') repeat-x;
  opacity: 0.1;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logo-icon {
  width: 4rem;
  height: 4rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.logo-icon:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.25);
}

.brand-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
}

.app-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

.welcome-message {
  text-align: right;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.welcome-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 400;
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  top: -1rem;
}

.login-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

/* Login Card */
.login-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.login-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-icon {
  width: 3.5rem;
  height: 3.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.form-subtitle {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.label-icon {
  font-size: 1rem;
}

.input-container {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.custom-input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: #f8fafc;
  transition: all 0.3s ease;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
}

.custom-input:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.custom-input.input-error {
  border-color: #ef4444;
  background: #fef2f2;
}

.custom-input.input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.error-message::before {
  content: '⚠️';
  font-size: 0.75rem;
}

.login-button {
  margin-top: 1rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  width: 100%;
  box-sizing: border-box;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
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
  gap: 0.75rem;
}

.button-icon {
  font-size: 1rem;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 1rem;
}

.message-success {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.message-error {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.message-icon {
  font-size: 1rem;
}

.security-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.security-icon {
  font-size: 1rem;
}

/* Features Section */
.features-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.feature-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.feature-description {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
}

/* Transitions */
.message-enter-active, .message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from, .message-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    gap: 2rem;
    text-align: center;
  }
  
  .welcome-message {
    text-align: center;
  }
  
  .login-section {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .features-section {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 1rem;
  }
  
  .feature-card {
    min-width: 280px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .header-content {
    padding: 0 1rem;
  }
  
  .app-title {
    font-size: 2rem;
  }
  
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .login-card {
    padding: 2rem 1.5rem;
    margin: 0;
    width: 100%;
  }
  
  .login-form {
    width: 100%;
  }
  
  .input-group {
    width: 100%;
  }
  
  .custom-input {
    width: 100%;
    min-width: 0;
  }
  
  .features-section {
    flex-direction: column;
  }
  
  .feature-card {
    min-width: auto;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .logo-section {
    flex-direction: column;
    gap: 1rem;
  }
  
  .brand-info {
    text-align: center;
  }
  
  .app-title {
    font-size: 1.75rem;
  }
  
  .welcome-title {
    font-size: 1.25rem;
  }
  
  .login-card {
    padding: 1.5rem 1rem;
    margin: 0;
    width: 100%;
  }
  
  .login-form {
    width: 100%;
  }
  
  .input-group {
    width: 100%;
  }
  
  .custom-input {
    width: 100%;
    min-width: 0;
    padding: 0.875rem 1rem;
  }
  
  .login-button {
    width: 100%;
    padding: 0.875rem 1.5rem;
  }
  
  .logo-icon {
    width: 3rem;
    height: 3rem;
    font-size: 1.5rem;
  }
}

/* Animation d'entrée */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-card,
.feature-card {
  animation: fadeInUp 0.6s ease-out;
}

.feature-card:nth-child(2) {
  animation-delay: 0.1s;
}

.feature-card:nth-child(3) {
  animation-delay: 0.2s;
}
</style>