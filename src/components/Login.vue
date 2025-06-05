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
const router = useRouter()

async function handleLogin() {
  // Validation
  if (!username.value) {
    usernameError.value = 'Le nom d\'utilisateur est requis'
    return
  }
  if (!password.value) {
    passwordError.value = 'Le mot de passe est requis'
    return
  }

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
      router.push('/import')
    }
  } catch (error) {
    success.value = false
    if (error.response) {
      message.value = "Échec: " + error.response.data.message
    } else {
      message.value = "Erreur réseau: " + error.message
    }
  }
}
</script>

<template>
  <div class="container">
    <div class="floating-box">
      <form @submit.prevent="handleLogin">
        <BaseInput
          id="username"
          label="Nom d'utilisateur"
          v-model="username"
          :error="usernameError"
          placeholder="Entrez votre nom d'utilisateur"
        />
        
        <BaseInput
          id="password"
          label="Mot de passe"
          type="password"
          v-model="password"
          :error="passwordError"
          placeholder="Entrez votre mot de passe"
        />
        
        <BaseButton 
          variant="primary" 
          type="submit"
        >
          Connexion
        </BaseButton>
        
        <p v-if="message" :class="{ 'error-message': !success, 'success-message': success }">
          {{ message }}
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary-color: #1e88e5;
  --primary-hover: #1565c0;
  --text-color: #1a1a2e;
  --background-light: #f5f6fa;
  --white: #ffffff;
  --error-color: #d32f2f;
  --success-color: #2e7d32;
  --border-radius: 16px;
  --box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  --input-border: #e0e0e0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(145deg, #6ab0ff 0%, #a5d6ff 100%);
  padding: 20px;
}

.floating-box {
  background: var(--white);
  padding: 2.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  width: 100%;
  max-width: 400px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.floating-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-hover));
}

.floating-box:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error-message {
  color: var(--error-color);
  font-size: 0.875rem;
  text-align: center;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: rgba(211, 47, 47, 0.1);
  transition: opacity 0.3s ease;
}

.success-message {
  color: var(--success-color);
  font-size: 0.875rem;
  text-align: center;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: rgba(46, 125, 50, 0.1);
  transition: opacity 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.floating-box {
  animation: slideIn 0.5s ease-out forwards;
}

@media (max-width: 480px) {
  .floating-box {
    padding: 1.5rem;
    max-width: 90%;
  }
}
</style>