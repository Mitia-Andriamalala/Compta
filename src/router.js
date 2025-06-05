import { createRouter, createWebHistory } from 'vue-router'
import Compte from './components/Compte.vue'
import Import from './components/Import.vue'
import Login from './components/Login.vue'
import LivreCompte from './components/LivreCompte.vue'
import Balance from './components/Balance.vue'

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/balance', name: 'Balance', component: Balance },

  { 
    path: '/compte', 
    name: 'Compte', 
    component: Compte, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/livreCompte', 
    name: 'LivreCompte', 
    component: LivreCompte, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/import', 
    name: 'Import', 
    component: Import, 
    meta: { requiresAuth: true } 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Garde de navigation
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('authToken')
  if (to.meta.requiresAuth && !token) {
    next('/')
  } else {
    next()
  }
})

export default router
