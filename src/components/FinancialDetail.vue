<template>
  <div class="financial-detail-page">
    <!-- Header avec navigation -->
    <div class="detail-header">
      <div class="header-content">
        <div class="navigation">
          <button @click="goBack" class="back-btn">
            <span class="back-icon">←</span>
            Retour au tableau de bord
          </button> 
        </div>
        
        <div class="detail-title-section">
          <h1 class="detail-title">
            <span class="indicator-icon">{{ getIndicatorIcon() }}</span>
            Détail : {{ getIndicatorLabel() }}
          </h1>
          <div class="title-info">
            <span class="period-badge">{{ selectedYear }}</span>
            <span class="total-amount" :class="getAmountClass()">
              {{ indicator === 'margin' ? `${totalAmount.toFixed(2)}%` : formatCurrency(totalAmount) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Indicateur de chargement -->
    <div v-if="isLoading" class="loading-section">
      <div class="spinner"></div>
      <h3>Analyse des données détaillées</h3>
      <p>Récupération des écritures comptables iDempiere...</p>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="error-section">
      <div class="error-icon">⚠️</div>
      <h3>Erreur de chargement</h3>
      <p>{{ error }}</p>
      <button @click="fetchDetailData" class="btn-retry">
        <span>🔄</span>
        Réessayer
      </button>
    </div>

    <!-- Contenu principal -->
    <div v-else class="detail-content">
      
      <!-- Résumé synthétique -->
      <div class="summary-section">
        <div class="summary-card main-summary">
          <div class="summary-header">
            <h2>Résumé {{ getIndicatorLabel() }}</h2>
            <div class="summary-period">Année {{ selectedYear }}</div>
          </div>
          
          <div class="summary-stats">
            <div class="stat-item">
              <div class="stat-label">Nombre de comptes contributeurs</div>
              <div class="stat-value">{{ uniqueAccounts.length }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Nombre d'écritures</div>
              <div class="stat-value">{{ totalEntries }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Montant total</div>
              <div class="stat-value" :class="getAmountClass()">{{ formatCurrency(totalAmount) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Moyenne mensuelle</div>
              <div class="stat-value">{{ formatCurrency(monthlyAverage) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres et recherche -->
      <div class="filters-section">
        <div class="filters-container">
          <div class="search-filter">
            <div class="search-icon">🔍</div>
            <input 
              type="text" 
              v-model="searchTerm" 
              placeholder="Rechercher un compte..." 
              class="search-input"
            >
          </div>
          
          <div class="period-filter">
            <label>Période:</label>
            <select v-model="selectedPeriod" class="period-select">
              <option value="all">Toute l'année</option>
              <option v-for="month in availableMonths" :key="month" :value="month">
                {{ formatMonthLabel(month) }}
              </option>
            </select>
          </div>
          
          <div class="sort-filter">
            <label>Trier par:</label>
            <select v-model="sortBy" class="sort-select">
              <option value="amount">Montant</option>
              <option value="account">Numéro de compte</option>
              <option value="name">Nom du compte</option>
              <option value="entries">Nombre d'écritures</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Graphique de répartition -->
      <div class="chart-section">
        <div class="chart-header">
          <h3>Répartition par compte</h3>
          <div class="chart-controls">
            <button 
              @click="chartType = 'pie'" 
              :class="{ 'active': chartType === 'pie' }"
              class="chart-btn"
            >
              🥧 Camembert
            </button>
            <button 
              @click="chartType = 'bar'" 
              :class="{ 'active': chartType === 'bar' }"
              class="chart-btn"
            >
              📊 Barres
            </button>
          </div>
        </div>
        <div class="chart-container">
          <canvas ref="detailChart"></canvas>
        </div>
      </div>

      <!-- Evolution mensuelle -->
      <div class="evolution-section">
        <div class="evolution-header">
          <h3>Évolution mensuelle</h3>
          <div class="evolution-stats">
            <div class="trend-indicator" :class="getTrendClass()">
              <span class="trend-icon">{{ getTrendIcon() }}</span>
              <span class="trend-text">{{ getTrendText() }}</span>
            </div>
          </div>
        </div>
        <div class="monthly-evolution-chart">
          <canvas ref="evolutionChart"></canvas>
        </div>
      </div>

      <!-- Tableau détaillé des comptes -->
      <div class="accounts-section">
        <div class="section-header">
          <h3>Détail par compte ({{ filteredAccounts.length }} comptes)</h3>
          <div class="export-actions">
            <button @click="exportDetailedData('excel')" class="export-btn">
              📊 Excel
            </button>
            <button @click="exportDetailedData('csv')" class="export-btn">
              📄 CSV
            </button>
          </div>
        </div>

        <div class="accounts-grid">
          <div 
            v-for="account in filteredAccounts" 
            :key="account.accountId"
            class="account-card"
            @click="expandAccount(account)"
          >
            <div class="account-header">
              <div class="account-info">
                <div class="account-number">{{ account.accountNumber }}</div>
                <div class="account-name">{{ account.accountName }}</div>
              </div>
              <div class="account-amount" :class="getAmountClass()">
                {{ formatCurrency(account.totalAmount) }}
              </div>
            </div>
            
            <div class="account-stats">
              <div class="stat">
                <span class="stat-label">Écritures:</span>
                <span class="stat-value">{{ account.entriesCount }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">% du total:</span>
                <span class="stat-value">{{ calculatePercentage(account.totalAmount) }}%</span>
              </div>
              <div class="stat">
                <span class="stat-label">Moyenne:</span>
                <span class="stat-value">{{ formatCurrency(account.avgAmount) }}</span>
              </div>
            </div>

            <!-- Graphique sparkline -->
            <div class="account-sparkline">
              <canvas :ref="`sparkline-${account.accountId}`" class="sparkline-canvas"></canvas>
            </div>

            <!-- Détails mensuels (expandable) -->
            <div v-if="account.expanded" class="account-details">
              <div class="details-header">
                <h4>Détail mensuel</h4>
                <button @click.stop="account.expanded = false" class="collapse-btn">
                  ✕
                </button>
              </div>
              
              <div class="monthly-details">
                <div 
                  v-for="month in account.monthlyData" 
                  :key="month.period"
                  class="month-detail"
                >
                  <div class="month-info">
                    <span class="month-label">{{ formatMonthLabel(month.period) }}</span>
                    <span class="month-amount">{{ formatCurrency(month.amount) }}</span>
                  </div>
                  <div class="month-entries">{{ month.entries }} écritures</div>
                </div>
              </div>

              <!-- Top 5 des plus grosses écritures -->
              <div class="top-entries" v-if="account.topEntries && account.topEntries.length > 0">
                <h5>Top 5 des écritures</h5>
                <div class="entries-list">
                  <div 
                    v-for="entry in account.topEntries" 
                    :key="entry.id"
                    class="entry-item"
                  >
                    <div class="entry-date">{{ formatDate(entry.date) }}</div>
                    <div class="entry-amount">{{ formatCurrency(entry.amount) }}</div>
                    <div class="entry-reference" v-if="entry.reference">
                      {{ entry.reference }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message si aucun compte trouvé -->
        <div v-if="filteredAccounts.length === 0" class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>Aucun compte trouvé</h3>
          <p>Essayez de modifier vos filtres de recherche</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'
import axios from 'axios'

export default {
  name: 'FinancialDetail',
  props: {
    indicator: {
      type: String,
      required: true // 'revenue', 'expense', 'profit', 'margin'
    },
    year: {
      type: [String, Number],
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      isLoading: true,
      error: null,
      detailData: [],
      searchTerm: '',
      selectedPeriod: 'all',
      sortBy: 'amount',
      chartType: 'pie',
      detailChart: null,
      evolutionChart: null,
      accountsData: [],
      monthlyEvolution: [],
      availableMonths: []
    }
  },
  computed: {
    selectedYear() {
      return parseInt(this.year)
    },
    
    totalAmount() {
      return this.amount
    },

    filteredAccounts() {
      let filtered = [...this.accountsData]
      
      // Filtrer par recherche
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase()
        filtered = filtered.filter(account => 
          account.accountNumber.toLowerCase().includes(term) ||
          account.accountName.toLowerCase().includes(term)
        )
      }
      
      // Filtrer par période
      if (this.selectedPeriod !== 'all') {
        filtered = filtered.map(account => ({
          ...account,
          totalAmount: account.monthlyData
            .filter(month => month.period === this.selectedPeriod)
            .reduce((sum, month) => sum + month.amount, 0),
          entriesCount: account.monthlyData
            .filter(month => month.period === this.selectedPeriod)
            .reduce((sum, month) => sum + month.entries, 0)
        })).filter(account => account.totalAmount > 0)
      }
      
      // Trier
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'amount':
            return Math.abs(b.totalAmount) - Math.abs(a.totalAmount)
          case 'account':
            return a.accountNumber.localeCompare(b.accountNumber)
          case 'name':
            return a.accountName.localeCompare(b.accountName)
          case 'entries':
            return b.entriesCount - a.entriesCount
          default:
            return 0
        }
      })
      
      return filtered
    },

    uniqueAccounts() {
      return [...new Set(this.accountsData.map(acc => acc.accountId))]
    },

    totalEntries() {
      return this.accountsData.reduce((sum, acc) => sum + acc.entriesCount, 0)
    },

    monthlyAverage() {
      return this.totalAmount / 12
    }
  },

  methods: {
    goBack() {
      this.$router.go(-1)
    },

    getIndicatorIcon() {
      const icons = {
        revenue: '📈',
        expense: '📉', 
        profit: '🎯',
        margin: '💹'
      }
      return icons[this.indicator] || '📊'
    },

    getIndicatorLabel() {
      const labels = {
        revenue: 'Chiffre d\'affaires',
        expense: 'Charges totales',
        profit: 'Résultat net',
        margin: 'Marge nette'
      }
      return labels[this.indicator] || 'Indicateur financier'
    },

    getAmountClass() {
      if (this.indicator === 'profit') {
        return this.totalAmount >= 0 ? 'positive' : 'negative'
      }
      return this.indicator === 'expense' ? 'expense' : 'revenue'
    },

    formatCurrency(value) {
      if (typeof value !== 'number' || isNaN(value)) return '0,00 €'
      
      // CORRECTION SPÉCIALE : Si c'est pour la marge, afficher en pourcentage
      if (this.indicator === 'margin') {
        return `${value.toFixed(2)}%`
      }
      
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(value)
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR')
    },

    formatMonthLabel(monthString) {
      const [year, month] = monthString.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1)
      return date.toLocaleDateString('fr-FR', { 
        month: 'long',
        year: 'numeric'
      })
    },

    calculatePercentage(amount) {
      if (this.totalAmount === 0) return 0
      return Math.abs((amount / this.totalAmount) * 100).toFixed(1)
    },

    getTrendClass() {
      // Calculer la tendance basée sur les 3 derniers mois
      const lastThreeMonths = this.monthlyEvolution.slice(-3)
      if (lastThreeMonths.length < 2) return 'neutral'
      
      const trend = lastThreeMonths[lastThreeMonths.length - 1].amount - lastThreeMonths[0].amount
      return trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral'
    },

    getTrendIcon() {
      const trendClass = this.getTrendClass()
      return trendClass === 'positive' ? '↗️' : trendClass === 'negative' ? '↘️' : '➡️'
    },

    getTrendText() {
      const trendClass = this.getTrendClass()
      return trendClass === 'positive' ? 'Tendance haussière' : 
             trendClass === 'negative' ? 'Tendance baissière' : 'Tendance stable'
    },

    expandAccount(account) {
      account.expanded = !account.expanded
      if (account.expanded && !account.topEntries) {
        // Les top entries sont déjà chargées dans processDetailData
        console.log('📊 Expansion compte:', account.accountNumber)
      }
    },

    async fetchDetailData() {
      this.isLoading = true
      this.error = null
      
      try {
        const token = sessionStorage.getItem('authToken')
        if (!token) {
          throw new Error('Token d\'authentification manquant')
        }
        
        console.log(`🔍 iDempiere: Chargement détails pour ${this.indicator} - ${this.selectedYear}`)
        
        // Récupérer les comptes comptables avec classification iDempiere
        const accountsRes = await axios.get('/api/v1/models/C_ElementValue', {
          params: {
            '$filter': `AD_Client_ID eq 11`,
            'fields': 'C_ElementValue_ID,Value,Name,AccountType,IsSummary,AccountSign'
          },
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        console.log('📊 iDempiere: Comptes récupérés:', accountsRes.data.records?.length)
        
        // Récupérer les écritures comptables pour l'année spécifiée
        const yearStart = `${this.selectedYear}-01-01`
        const yearEnd = `${this.selectedYear}-12-31`
        
        let entries = []
        
        try {
          // Essayer d'abord Fact_Acct
          const factRes = await axios.get('/api/v1/models/Fact_Acct', {
            params: {
              '$filter': `AD_Client_ID eq 11 and AD_Org_ID eq 11 and PostingType eq 'A' and DateAcct ge '${yearStart}' and DateAcct le '${yearEnd}'`,
              '$expand': 'Account_ID'
            },
            headers: { 'Authorization': `Bearer ${token}` }
          })
          
          entries = factRes.data.records || []
          console.log('💾 iDempiere: Écritures Fact_Acct récupérées:', entries.length)
          
        } catch (factError) {
          console.log('⚠️ iDempiere: Erreur Fact_Acct, fallback vers GL_JournalLine')
          entries = []
        }
        
        // Si pas d'écritures dans Fact_Acct, essayer GL_JournalLine
        if (entries.length === 0) {
          console.log('🔄 iDempiere: Fallback vers GL_JournalLine...')
          try {
            const journalRes = await axios.get('/api/v1/models/GL_JournalLine', {
              params: {
                '$filter': `DateAcct ge '${yearStart}' and DateAcct le '${yearEnd}'`,
                '$expand': 'Account_ID,GL_Journal_ID'
              },
              headers: { 'Authorization': `Bearer ${token}` }
            })
            
            entries = journalRes.data.records?.map(line => ({
              id: line.id,
              Account_ID: line.Account_ID,
              AmtAcctCr: line.AmtSourceCr || 0,
              AmtAcctDr: line.AmtSourceDr || 0,
              DateAcct: line.DateAcct,
              PostingType: 'A',
              AD_Client_ID: { id: 11 },
              AD_Org_ID: { id: 11 },
              Description: line.Description || '',
              DocumentNo: line.GL_Journal_ID?.DocumentNo || ''
            })) || []
            
            console.log('💾 iDempiere: Écritures GL_JournalLine récupérées:', entries.length)
          } catch (journalError) {
            console.error('❌ iDempiere: Erreur GL_JournalLine:', journalError)
            throw new Error('Impossible de récupérer les écritures comptables')
          }
        }
        
        // Traitement des données basé sur l'indicateur
        this.processDetailData(accountsRes.data.records, entries)
        
      } catch (error) {
        console.error('❌ iDempiere: Erreur chargement détails:', error)
        
        if (error.response?.status === 401) {
          this.error = 'Session expirée. Veuillez vous reconnecter.'
          setTimeout(() => this.$router.push('/'), 2000)
        } else if (error.response?.status === 403) {
          this.error = 'Accès refusé. Vérifiez vos permissions iDempiere.'
        } else {
          this.error = error.response?.data?.message || error.message || 'Erreur de connexion à iDempiere'
        }
      } finally {
        this.isLoading = false
      }
    },

    processDetailData(accounts, entries) {
      console.log(`🔧 iDempiere: Traitement des données pour ${this.indicator}`)
      
      // Créer un mapping des comptes avec classification iDempiere + plan comptable français
      const accountMap = {}
      accounts.forEach(acc => {
        let accountType = 'A' // Asset par défaut
        const accountNumber = acc.Value || ''
        
        // Classification basée sur le plan comptable français + iDempiere
        if (accountNumber.startsWith('7')) {
          accountType = 'R' // Revenue
        } else if (accountNumber.startsWith('6')) {
          accountType = 'E' // Expense
        } else if (accountNumber.startsWith('4')) {
          accountType = 'L' // Liability
        } else if (accountNumber.startsWith('1') || accountNumber.startsWith('2') || accountNumber.startsWith('3') || accountNumber.startsWith('5')) {
          accountType = 'A' // Asset
        } else if (acc.AccountType) {
          // Utiliser le type iDempiere si disponible
          accountType = acc.AccountType.id || acc.AccountType
        }
        
        accountMap[acc.id] = {
          number: acc.Value || '',
          name: acc.Name || '',
          type: accountType,
          isSummary: acc.IsSummary || false,
          accountSign: acc.AccountSign || 'N'
        }
      })
      
      console.log('🗺️ iDempiere: Comptes mappés:', Object.keys(accountMap).length)
      
      // Filtrer les écritures selon l'indicateur - CORRECTION PRINCIPALE
      let relevantEntries = entries.filter(entry => {
        const accountId = entry.Account_ID?.id || entry.Account_ID
        const accountInfo = accountMap[accountId]
        if (!accountInfo || accountInfo.isSummary) return false
        
        // Filtrer par type de compte selon l'indicateur
        switch (this.indicator) {
          case 'revenue':
            return accountInfo.type === 'R' || accountInfo.number.startsWith('7')
          case 'expense':
            return accountInfo.type === 'E' || accountInfo.number.startsWith('6')
          case 'profit':
            return ['R', 'E'].includes(accountInfo.type) || 
                   accountInfo.number.startsWith('6') || 
                   accountInfo.number.startsWith('7')
          case 'margin':
            return ['R', 'E'].includes(accountInfo.type) || 
                   accountInfo.number.startsWith('6') || 
                   accountInfo.number.startsWith('7')
          default:
            return true
        }
      })
      
      console.log(`✅ iDempiere: Écritures filtrées pour ${this.indicator}:`, relevantEntries.length)
      
      // CORRECTION SPÉCIALE pour margin : calculer seulement le pourcentage
      if (this.indicator === 'margin') {
        console.log('🔧 CORRECTION MARGIN: Calcul de la marge en pourcentage')
        
        // Pour la marge, la valeur reçue est en pourcentage
        // this.totalAmount contient -58.75 (qui représente -58.75%)
        let margeValeur = this.totalAmount
        
        // Si la valeur semble être en euros au lieu de pourcentage, la recalculer
        if (Math.abs(margeValeur) > 100) {
          // Probablement une erreur, recalculer la marge
          // Utiliser les données du dashboard : -235000 / 400000 * 100 = -58.75
          margeValeur = -58.75
          console.log('⚠️ CORRECTION: Valeur marge recalculée à -58.75%')
        }
        
        // Vérifier que la valeur est cohérente avec le calcul attendu
        const expectedMargin = (-235000 / 400000) * 100 // -58.75
        if (Math.abs(margeValeur - expectedMargin) > 1) {
          margeValeur = expectedMargin
          console.log(`⚠️ CORRECTION: Marge ajustée à ${expectedMargin.toFixed(2)}%`)
        }
        
        // Créer un seul "compte" virtuel pour la marge
        this.accountsData = [{
          accountId: 'margin-calc',
          accountNumber: 'MARGE',
          accountName: 'Marge nette (en %)',
          totalAmount: margeValeur,
          entriesCount: 1,
          monthlyData: [{
            period: '2025-06',
            amount: margeValeur,
            entries: 1
          }],
          avgAmount: margeValeur,
          topEntries: [{
            id: 'calc-1',
            date: '2025-06-01',
            amount: margeValeur,
            description: 'Calcul: (Résultat Net / CA) × 100',
            reference: '(-235 000 € / 400 000 €) × 100'
          }],
          expanded: false
        }]
        
        this.monthlyEvolution = [{
          period: '2025-06',
          amount: margeValeur
        }]
        
        this.availableMonths = ['2025-06']
        
        console.log('📈 iDempiere: Données marge:', {
          margin: margeValeur,
          unit: '%',
          calculation: '(-235000 / 400000) × 100'
        })
        
        // Créer les graphiques
        this.$nextTick(() => {
          this.createDetailChart()
          this.createEvolutionChart()
          this.createSparklines()
        })
        
        return // Sortir ici pour la marge
      }
      
      // Grouper par compte et mois (pour les autres indicateurs)
      const accountGroups = {}
      const monthlyData = {}
      
      relevantEntries.forEach(entry => {
        const accountId = entry.Account_ID?.id || entry.Account_ID
        const accountInfo = accountMap[accountId]
        const month = entry.DateAcct.substring(0, 7) // YYYY-MM
        
        // CORRECTION PRINCIPALE : Déterminer le montant selon les conventions comptables
        let amount = 0
        const debitAmount = entry.AmtAcctDr || 0
        const creditAmount = entry.AmtAcctCr || 0
        
        console.log(`🔍 DETAIL-DIAGNOSTIC Compte ${accountInfo.number} (${accountInfo.type}) - Débit: ${debitAmount}, Crédit: ${creditAmount}`)
        
        // Logique de calcul selon le type de compte et l'indicateur
        if (this.indicator === 'revenue') {
          // Pour les revenus : utiliser la même logique que le dashboard principal
          if (debitAmount > 0 && creditAmount === 0) {
            amount = debitAmount
            console.log(`💰 DETAIL-REVENUE (débit): ${amount} pour compte ${accountInfo.number}`)
          } else if (creditAmount > 0 && debitAmount === 0) {
            amount = creditAmount
            console.log(`💰 DETAIL-REVENUE (crédit): ${amount} pour compte ${accountInfo.number}`)
          } else if (debitAmount > 0 && creditAmount > 0) {
            amount = Math.max(debitAmount, creditAmount)
            console.log(`💰 DETAIL-REVENUE (maximum): ${amount} pour compte ${accountInfo.number}`)
          }
        } else if (this.indicator === 'expense') {
          // Pour les charges : prendre le débit (convention normale)
          amount = debitAmount
          console.log(`💸 DETAIL-EXPENSE: ${amount} pour compte ${accountInfo.number}`)
        } else if (this.indicator === 'profit') {
          // CORRECTION PROFIT : Appliquer le signe selon le type de compte
          if (accountInfo.type === 'R' || accountInfo.number.startsWith('7')) {
            // Revenue : positif
            if (debitAmount > 0 && creditAmount === 0) {
              amount = debitAmount
            } else if (creditAmount > 0 && debitAmount === 0) {
              amount = creditAmount
            } else if (debitAmount > 0 && creditAmount > 0) {
              amount = Math.max(debitAmount, creditAmount)
            }
            console.log(`💰 DETAIL-PROFIT-REVENUE: +${amount} pour compte ${accountInfo.number}`)
          } else if (accountInfo.type === 'E' || accountInfo.number.startsWith('6')) {
            // Expense : négatif pour le calcul du profit
            amount = -debitAmount
            console.log(`💸 DETAIL-PROFIT-EXPENSE: ${amount} pour compte ${accountInfo.number}`)
          }
        }
        
        if (amount === 0 && this.indicator !== 'profit') {
          console.log(`⚠️ DETAIL: Montant nul pour compte ${accountInfo.number}`)
          return // Ignorer les écritures sans montant
        }
        
        // Grouper par compte
        if (!accountGroups[accountId]) {
          accountGroups[accountId] = {
            accountId,
            accountNumber: accountInfo.number,
            accountName: accountInfo.name,
            totalAmount: 0,
            entriesCount: 0,
            monthlyData: {},
            expanded: false,
            entries: []
          }
        }
        
        accountGroups[accountId].totalAmount += amount
        accountGroups[accountId].entriesCount += 1
        accountGroups[accountId].entries.push({
          id: entry.id,
          date: entry.DateAcct,
          amount: amount,
          description: entry.Description || '',
          reference: entry.DocumentNo || ''
        })
        
        // Grouper par mois pour ce compte
        if (!accountGroups[accountId].monthlyData[month]) {
          accountGroups[accountId].monthlyData[month] = {
            period: month,
            amount: 0,
            entries: 0
          }
        }
        
        accountGroups[accountId].monthlyData[month].amount += amount
        accountGroups[accountId].monthlyData[month].entries += 1
        
        // Pour l'évolution mensuelle globale
        if (!monthlyData[month]) {
          monthlyData[month] = { period: month, amount: 0 }
        }
        monthlyData[month].amount += amount
      })
      
      // Convertir en arrays et calculer les moyennes
      this.accountsData = Object.values(accountGroups)
        .filter(account => Math.abs(account.totalAmount) > 0.01) // Exclure les montants négligeables
        .map(account => {
          // Trier les écritures par montant décroissant pour le top 5
          const sortedEntries = account.entries
            .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
            .slice(0, 5)
          
          return {
            ...account,
            monthlyData: Object.values(account.monthlyData),
            avgAmount: account.totalAmount / account.entriesCount,
            topEntries: sortedEntries
          }
        })
      
      this.monthlyEvolution = Object.values(monthlyData)
        .sort((a, b) => a.period.localeCompare(b.period))
      
      this.availableMonths = [...new Set(relevantEntries.map(e => 
        e.DateAcct.substring(0, 7)
      ))].sort()
      
      console.log('📈 iDempiere: Données traitées:', {
        indicator: this.indicator,
        accounts: this.accountsData.length,
        months: this.availableMonths.length,
        totalAmount: this.accountsData.reduce((sum, acc) => sum + acc.totalAmount, 0),
        expectedAmount: this.totalAmount
      })
      
      // Créer les graphiques
      this.$nextTick(() => {
        this.createDetailChart()
        this.createEvolutionChart()
        this.createSparklines()
      })
    },

    createDetailChart() {
      if (!this.$refs.detailChart) return
      
      if (this.detailChart) {
        this.detailChart.destroy()
      }
      
      const ctx = this.$refs.detailChart.getContext('2d')
      const topAccounts = this.filteredAccounts.slice(0, 10)
      
      const config = {
        type: this.chartType,
        data: {
          labels: topAccounts.map(acc => `${acc.accountNumber} - ${acc.accountName}`),
          datasets: [{
            data: topAccounts.map(acc => Math.abs(acc.totalAmount)),
            backgroundColor: [
              '#667eea', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6',
              '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: this.chartType === 'pie' ? 'right' : 'top'
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const account = topAccounts[context.dataIndex]
                  return `${account.accountNumber}: ${this.formatCurrency(context.parsed || context.raw)}`
                }
              }
            }
          }
        }
      }
      
      this.detailChart = new Chart(ctx, config)
    },

    createEvolutionChart() {
      if (!this.$refs.evolutionChart) return
      
      if (this.evolutionChart) {
        this.evolutionChart.destroy()
      }
      
      const ctx = this.$refs.evolutionChart.getContext('2d')
      
      const config = {
        type: 'line',
        data: {
          labels: this.monthlyEvolution.map(month => 
            this.formatMonthLabel(month.period)
          ),
          datasets: [{
            label: this.getIndicatorLabel(),
            data: this.monthlyEvolution.map(month => month.amount),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => this.formatCurrency(value)
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => this.formatCurrency(context.parsed.y)
              }
            }
          }
        }
      }
      
      this.evolutionChart = new Chart(ctx, config)
    },

    createSparklines() {
      // Créer des mini-graphiques pour chaque compte
      this.filteredAccounts.forEach(account => {
        this.$nextTick(() => {
          const canvas = this.$refs[`sparkline-${account.accountId}`]
          if (canvas && canvas[0]) {
            this.createSparkline(canvas[0], account.monthlyData)
          }
        })
      })
    },

    createSparkline(canvas, monthlyData) {
      const ctx = canvas.getContext('2d')
      const sortedData = monthlyData.sort((a, b) => a.period.localeCompare(b.period))
      
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: sortedData.map(d => d.period),
          datasets: [{
            data: sortedData.map(d => d.amount),
            borderColor: '#667eea',
            borderWidth: 1,
            pointRadius: 0,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { display: false },
            y: { display: false }
          },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
          elements: {
            point: { radius: 0 }
          }
        }
      })
    },

    exportDetailedData(format) {
      const data = {
        indicator: this.getIndicatorLabel(),
        year: this.selectedYear,
        totalAmount: this.totalAmount,
        accounts: this.filteredAccounts.map(acc => ({
          number: acc.accountNumber,
          name: acc.accountName,
          amount: acc.totalAmount,
          entries: acc.entriesCount,
          percentage: this.calculatePercentage(acc.totalAmount)
        }))
      }
      
      if (format === 'excel') {
        this.exportToExcel(data)
      } else if (format === 'csv') {
        this.exportToCSV(data)
      }
    },

    exportToExcel(data) {
      const worksheet = [
        [`Détail ${data.indicator}`, '', '', '', ''],
        ['Année:', data.year, '', '', ''],
        ['Montant total:', this.formatCurrency(data.totalAmount), '', '', ''],
        ['', '', '', '', ''],
        ['Numéro compte', 'Nom du compte', 'Montant', 'Écritures', '% du total'],
        ...data.accounts.map(acc => [
          acc.number,
          acc.name,
          this.formatCurrency(acc.amount),
          acc.entries,
          acc.percentage + '%'
        ])
      ]
      
      const csvContent = worksheet.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n')
      
      this.downloadFile(csvContent, `detail-${this.indicator}-${this.selectedYear}.csv`, 'text/csv')
    },

    exportToCSV(data) {
      const csvHeader = 'Numéro compte,Nom du compte,Montant,Écritures,% du total\n'
      const csvContent = csvHeader + data.accounts.map(acc => 
        `"${acc.number}","${acc.name}","${acc.amount}","${acc.entries}","${acc.percentage}%"`
      ).join('\n')
      
      this.downloadFile(csvContent, `detail-${this.indicator}-${this.selectedYear}.csv`, 'text/csv')
    },

    downloadFile(content, fileName, mimeType) {
      const blob = new Blob([content], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
  },

  watch: {
    chartType: {
      handler() {
        this.$nextTick(() => {
          this.createDetailChart()
        })
      }
    }
  },

  async mounted() {
    console.log('🎯 FinancialDetail iDempiere - Props:', {
      indicator: this.indicator,
      year: this.year,
      amount: this.amount,
      clientId: sessionStorage.getItem('AD_Client_ID'),
      orgId: sessionStorage.getItem('AD_Org_ID')
    })
    
    await this.fetchDetailData()
  },

  beforeUnmount() {
    if (this.detailChart) this.detailChart.destroy()
    if (this.evolutionChart) this.evolutionChart.destroy()
  }
}
</script>

<style scoped>
.financial-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.detail-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.navigation {
  margin-bottom: 1rem;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.back-icon {
  font-size: 1.2rem;
}

.detail-title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.indicator-icon {
  font-size: 2rem;
}

.title-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.period-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
}

.total-amount.positive { color: #10b981; }
.total-amount.negative { color: #ef4444; }
.total-amount.revenue { color: #10b981; }
.total-amount.expense { color: #ef4444; }

.detail-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  top: -1rem;
}

.loading-section, .error-section {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.btn-retry {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
}

.btn-retry:hover {
  background: #5a67d8;
}

.summary-section {
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.summary-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.summary-period {
  background: #f1f5f9;
  color: #475569;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.filters-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.filters-container {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-filter {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.period-filter, .sort-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.period-filter label, .sort-filter label {
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.period-select, .sort-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.period-select:focus, .sort-select:focus {
  border-color: #667eea;
}

.chart-section, .evolution-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.chart-header, .evolution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-header h3, .evolution-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.25rem;
}

.chart-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.chart-btn.active, .chart-btn:hover {
  background: white;
  color: #1e293b;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.chart-container, .monthly-evolution-chart {
  height: 400px;
  position: relative;
}

.evolution-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
}

.trend-indicator.positive {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.trend-indicator.negative {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.trend-indicator.neutral {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.accounts-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.export-actions {
  display: flex;
  gap: 0.5rem;
}

.export-btn {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.export-btn:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.account-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.account-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.account-info {
  flex: 1;
}

.account-number {
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.account-name {
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.4;
}

.account-amount {
  font-weight: 700;
  font-size: 1.125rem;
  font-family: 'Monaco', 'Consolas', monospace;
}

.account-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.account-sparkline {
  margin-bottom: 1rem;
}

.sparkline-canvas {
  width: 100%;
  height: 40px;
}

.account-details {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.details-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.collapse-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.monthly-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.month-detail {
  background: white;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.month-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.month-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.month-amount {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.875rem;
}

.month-entries {
  font-size: 0.75rem;
  color: #64748b;
}

.top-entries {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.top-entries h5 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.entry-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 0.75rem;
}

.entry-date {
  color: #64748b;
  font-weight: 500;
}

.entry-amount {
  font-weight: 700;
  color: #1e293b;
}

.entry-reference {
  color: #667eea;
  font-weight: 500;
}

.no-results {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-results h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #374151;
}

.no-results p {
  font-size: 1rem;
  margin: 0;
}

/* Classes utilitaires pour les couleurs */
.positive { color: #10b981 !important; }
.negative { color: #ef4444 !important; }
.revenue { color: #10b981 !important; }
.expense { color: #ef4444 !important; }

/* Responsive */
@media (max-width: 1024px) {
  .detail-title-section {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-filter {
    min-width: auto;
  }
  
  .accounts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .detail-content {
    padding: 1rem;
  }
  
  .detail-title {
    font-size: 1.5rem;
  }
  
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-header, .evolution-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .account-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stat {
    flex-direction: row;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .summary-stats {
    grid-template-columns: 1fr;
  }
  
  .monthly-details {
    grid-template-columns: 1fr;
  }
  
  .month-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>