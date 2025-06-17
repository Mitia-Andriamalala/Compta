import { createRouter, createWebHistory } from 'vue-router'
import Compte from './components/Compte.vue'
import Import from './components/Import.vue'
import Login from './components/Login.vue'
import LivreCompte from './components/LivreCompte.vue'
import AllAccountBooks from './components/AllAccountBooks.vue'
import Balance from './components/Balance.vue'
import FinancialDashboard from './components/FinancialDashboard.vue'
import FinancialDetail from './components/FinancialDetail.vue'
import Rapport from './components/Rapport.vue'
import FactureList from './components/FactureList.vue'
import FactureCreation from './components/FactureCreation.vue'
import AccountingEntries from './components/AccountingEntries.vue' // NOUVEAU composant
import Graphiques from './components/Graphiques.vue' // NOUVEAU composant pour les graphiques

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/balance',
    name: 'Balance',
    component: Balance,
    meta: { 
      requiresAuth: true,
      title: 'Liste des Comptes',
      description: 'Consultez les soldes et détails de tous vos comptes comptables'
    }
  },
  {
    path: '/compte',
    name: 'Compte',
    component: Compte,
    meta: { 
      requiresAuth: true,
      title: 'Gestion des Comptes',
      description: 'Gérez vos comptes comptables et leurs paramètres'
    }
  },
  {
    path: '/livreCompte',
    name: 'LivreCompte',
    component: LivreCompte,
    meta: { 
      requiresAuth: true,
      title: 'Livre de Compte',
      description: 'Consultez les écritures comptables détaillées'
    }
  },
  // NOUVELLE ROUTE pour la saisie d'écritures comptables
  {
    path: '/ecritures-comptables',
    name: 'AccountingEntries',
    component: AccountingEntries,
    meta: { 
      requiresAuth: true,
      title: 'Saisie d\'Écritures Comptables',
      description: 'Saisissez et gérez vos écritures comptables avec le plan de comptes',
      icon: '📝',
      category: 'comptabilite'
    }
  },
  // Routes alternatives pour une meilleure UX de saisie
  {
    path: '/saisie-ecritures',
    redirect: '/ecritures-comptables'
  },
  {
    path: '/journal-comptable',
    redirect: '/ecritures-comptables'
  },
  {
    path: '/nouvelle-ecriture',
    name: 'NewEntry',
    component: AccountingEntries,
    meta: {
      requiresAuth: true,
      title: 'Nouvelle Écriture Comptable',
      description: 'Créez une nouvelle écriture comptable',
      defaultMode: 'entry' // Pour ouvrir directement le formulaire d'écriture
    }
  },
  {
    path: '/plan-comptable',
    name: 'ChartOfAccounts',
    component: AccountingEntries,
    meta: {
      requiresAuth: true,
      title: 'Plan Comptable',
      description: 'Gérez votre plan de comptes',
      defaultMode: 'accounts' // Pour ouvrir directement la section plan de comptes
    }
  },
  // ROUTE pour tous les livres de compte
  {
    path: '/tous-les-comptes',
    name: 'AllAccountBooks',
    component: AllAccountBooks,
    meta: { 
      requiresAuth: true,
      title: 'Tous les Livres de Compte',
      description: 'Vue d\'ensemble de tous les comptes avec leurs totaux et soldes',
      icon: '📚',
      category: 'comptabilite'
    }
  },
  // Routes alternatives pour une meilleure UX
  {
    path: '/livres-compte',
    redirect: '/tous-les-comptes'
  },
  {
    path: '/vue-ensemble-comptes',
    redirect: '/tous-les-comptes'
  },
  {
    path: '/dashboard-comptes',
    redirect: '/tous-les-comptes'
  },
  {
    path: '/import',
    name: 'Import',
    component: Import,
    meta: { 
      requiresAuth: true,
      title: 'Import de Données',
      description: 'Importez vos données comptables depuis des fichiers externes'
    }
  },
  {
    path: '/financial-dashboard',
    name: 'FinancialDashboard',
    component: FinancialDashboard,
    meta: { 
      requiresAuth: true,
      title: 'Tableau de Bord Financier',
      description: 'Vue d\'ensemble de votre situation financière'
    }
  },
  
  // ROUTE pour les détails financiers
  {
    path: '/financial-detail/:indicator/:year',
    name: 'FinancialDetail',
    component: FinancialDetail,
    props: route => ({
      indicator: route.params.indicator,
      year: route.params.year,
      amount: parseFloat(route.query.amount || 0)
    }),
    meta: {
      requiresAuth: true,
      title: 'Détail Financier',
      description: 'Analyse détaillée des données financières',
      category: 'finance'
    },
    // Validation des paramètres
    beforeEnter: (to, from, next) => {
      const validIndicators = ['revenue', 'expense', 'profit', 'margin']
      const validYear = /^\d{4}$/.test(to.params.year)
      
      console.log(`🔍 Validation route FinancialDetail:`, {
        indicator: to.params.indicator,
        year: to.params.year,
        validIndicator: validIndicators.includes(to.params.indicator),
        validYear: validYear
      })
      
      if (validIndicators.includes(to.params.indicator) && validYear) {
        next()
      } else {
        console.warn('⚠️ Paramètres invalides, redirection vers dashboard')
        // Rediriger vers le dashboard si paramètres invalides
        next({ name: 'FinancialDashboard' })
      }
    }
  },
  // NOUVELLE ROUTE pour les graphiques et visualisations
  {
    path: '/graphiques',
    name: 'Graphiques',
    component: Graphiques,
    meta: {
      requiresAuth: true,
      title: 'Graphiques et Visualisations',
      description: 'Visualisez vos données comptables et financières sous forme de graphiques',
      icon: '📊',
      category: 'analytics'
    }
  },
  // Routes alternatives pour les graphiques
  {
    path: '/analytics',
    redirect: '/graphiques'
  },
  {
    path: '/visualisations',
    redirect: '/graphiques'
  },
  {
    path: '/charts',
    redirect: '/graphiques'
  },
  {
    path: '/dashboard-graphiques',
    redirect: '/graphiques'
  },
  {
    path: '/rapports',
    name: 'Rapport',
    component: Rapport,
    meta: { 
      requiresAuth: true,
      title: 'Rapports Comptables',
      description: 'Générez et consultez vos rapports comptables'
    }
  },
  {
    path: '/factures',
    name: 'FactureList',
    component: FactureList,
    meta: {
      requiresAuth: true,
      title: 'Liste des Factures',
      description: 'Consultez et gérez toutes vos factures clients et fournisseurs'
    }
  },
  {
    path: '/facture-creation',
    name: 'FactureCreation',
    component: FactureCreation,
    meta: {
      requiresAuth: true,
      title: 'Nouvelle Facture',
      description: 'Créez de nouvelles factures et enregistrez des règlements',
      icon: '📋',
      category: 'facturation'
    }
  },
  // Routes alternatives pour une meilleure UX
  {
    path: '/nouvelle-facture',
    redirect: '/facture-creation'
  },
  {
    path: '/reglement',
    name: 'Reglement',
    component: FactureCreation,
    meta: {
      requiresAuth: true,
      title: 'Nouveau Règlement',
      description: 'Enregistrez un nouveau règlement',
      defaultTab: 'reglement' // Pour ouvrir directement l'onglet règlement
    }
  },
  // Route alternative pour les détails financiers (URLs plus conviviales)
  {
    path: '/finance/:indicator/:year',
    redirect: to => {
      return {
        name: 'FinancialDetail',
        params: {
          indicator: to.params.indicator,
          year: to.params.year
        },
        query: to.query
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Garde de navigation améliorée
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('authToken')
 
  // Vérification de l'authentification
  if (to.meta.requiresAuth && !token) {
    console.log('🔒 Accès refusé - Authentification requise')
    next('/')
    return
  }
 
  // Définir le titre de la page dynamiquement
  if (to.meta.title) {
    let pageTitle = to.meta.title
    
    // Personnaliser le titre pour les détails financiers
    if (to.name === 'FinancialDetail') {
      const indicatorNames = {
        revenue: 'Chiffre d\'affaires',
        expense: 'Charges',
        profit: 'Résultat net',
        margin: 'Marge nette'
      }
      const indicatorName = indicatorNames[to.params.indicator] || to.params.indicator
      pageTitle = `${indicatorName} ${to.params.year} - Détail Financier`
    }
    
    // Personnaliser le titre pour les écritures comptables
    if (to.name === 'NewEntry') {
      pageTitle = 'Nouvelle Écriture - Saisie Comptable'
    } else if (to.name === 'ChartOfAccounts') {
      pageTitle = 'Plan Comptable - Gestion des Comptes'
    }
    
    document.title = `${pageTitle} - Système Comptable`
  } else {
    document.title = 'Système Comptable'
  }
 
  // Log de navigation pour debug
  console.log(`🧭 Navigation: ${from.name || 'Unknown'} → ${to.name}`)
  
  // Log spécial pour les navigations financières
  if (to.name === 'FinancialDetail') {
    console.log(`📊 Accès détail financier:`, {
      indicator: to.params.indicator,
      year: to.params.year,
      amount: to.query.amount,
      fromPage: from.name
    })
  }

  // Log spécial pour la page tous les comptes
  if (to.name === 'AllAccountBooks') {
    console.log(`📚 Accès vue d'ensemble des comptes depuis:`, from.name)
  }

  // Log spécial pour les écritures comptables
  if (['AccountingEntries', 'NewEntry', 'ChartOfAccounts'].includes(to.name)) {
    console.log(`📝 Accès module écritures comptables:`, {
      page: to.name,
      mode: to.meta.defaultMode || 'full',
      fromPage: from.name
    })
  }

  // Log spécial pour les graphiques
  if (to.name === 'Graphiques') {
    console.log(`📊 Accès module graphiques depuis:`, from.name)
  }
 
  // Gestion des paramètres spéciaux pour certaines pages
  if (to.name === 'Reglement' && to.meta.defaultTab) {
    // Passer l'onglet par défaut via query params
    if (!to.query.tab) {
      next({
        ...to,
        query: { ...to.query, tab: to.meta.defaultTab }
      })
      return
    }
  }

  // Gestion des modes par défaut pour les écritures comptables
  if (['NewEntry', 'ChartOfAccounts'].includes(to.name) && to.meta.defaultMode) {
    if (!to.query.mode) {
      next({
        ...to,
        query: { ...to.query, mode: to.meta.defaultMode }
      })
      return
    }
  }
 
  next()
})

// Garde après navigation pour analytics/logging
router.afterEach((to, from) => {
  // Log pour audit trail
  if (to.meta.requiresAuth) {
    const userId = sessionStorage.getItem('userId')
    console.log(`📊 Page visitée: ${to.name} par utilisateur ${userId}`)
   
    // Log spécifique pour les actions de facturation
    if (to.meta.category === 'facturation') {
      console.log(`💼 Accès module facturation: ${to.meta.title}`)
    }
    
    // Log spécifique pour les analyses financières
    if (to.meta.category === 'finance') {
      console.log(`💰 Accès module finance: ${to.meta.title}`)
      
      // Pour les détails financiers, logger les paramètres
      if (to.name === 'FinancialDetail') {
        console.log(`🔍 Analyse financière demandée:`, {
          indicator: to.params.indicator,
          year: to.params.year,
          timestamp: new Date().toISOString()
        })
      }
    }

    // Log spécifique pour les modules comptables
    if (to.meta.category === 'comptabilite') {
      console.log(`📋 Accès module comptabilité: ${to.meta.title}`)
      
      // Pour la vue d'ensemble des comptes
      if (to.name === 'AllAccountBooks') {
        console.log(`📚 Vue d'ensemble des comptes consultée:`, {
          timestamp: new Date().toISOString(),
          fromPage: from.name
        })
      }

      // Pour les écritures comptables
      if (['AccountingEntries', 'NewEntry', 'ChartOfAccounts'].includes(to.name)) {
        console.log(`📝 Module écritures comptables consulté:`, {
          page: to.name,
          mode: to.query.mode || 'full',
          timestamp: new Date().toISOString(),
          fromPage: from.name
        })
      }
    }

    // Log spécifique pour les graphiques et analytics
    if (to.meta.category === 'analytics') {
      console.log(`📊 Accès module analytics: ${to.meta.title}`)
      
      // Pour les graphiques
      if (to.name === 'Graphiques') {
        console.log(`📈 Module graphiques consulté:`, {
          timestamp: new Date().toISOString(),
          fromPage: from.name
        })
      }
    }
   
    // Ici vous pourriez ajouter un appel API pour logger l'accès
    // logPageAccess(to.name, userId, to.meta.category, to.params)
  }
})

export default router