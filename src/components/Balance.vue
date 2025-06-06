<template>
  <div class="page-container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">💼</span>
          Liste des Comptes
        </h1>
        <p class="page-subtitle">Gérez et consultez tous vos comptes comptables</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Search Section -->
      <div class="search-section">
        <div class="search-container">
          <div class="search-icon">🔍</div>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher par nom ou numéro de compte..."
            class="search-input"
          />
          <div class="search-clear" v-if="searchQuery" @click="searchQuery = ''">✕</div>
        </div>
        <div class="results-count" v-if="searchQuery">
          {{ filteredItems.length }} résultat(s) trouvé(s)
        </div>
      </div>

      <!-- Accounts Grid -->
      <div class="accounts-grid">
        <div 
          v-for="(item, index) in filteredItems" 
          :key="index" 
          @click="handleButtonClick(item)"
          class="account-card"
          :class="{ 'positive-balance': item.balance.balance >= 0, 'negative-balance': item.balance.balance < 0 }"
        >
          <!-- Card Header -->
          <div class="card-header">
            <div class="account-number">{{ item.Value }}</div>
            <div class="balance-indicator" :class="{ 'positive': item.balance.balance >= 0, 'negative': item.balance.balance < 0 }">
              {{ item.balance.balance >= 0 ? '↗️' : '↘️' }}
            </div>
          </div>

          <!-- Account Name -->
          <h3 class="account-name">{{ item.Name }}</h3>

          <!-- Balance Details -->
          <div class="balance-details">
            <div class="balance-row">
              <span class="label">Total Débit:</span>
              <span class="value debit">{{ formatCurrency(item.balance.totalDebit) }}</span>
            </div>
            <div class="balance-row">
              <span class="label">Total Crédit:</span>
              <span class="value credit">{{ formatCurrency(item.balance.totalCredit) }}</span>
            </div>
            <div class="balance-divider"></div>
            <div class="balance-row final-balance">
              <span class="label">Solde:</span>
              <span class="value balance" :class="{ 'positive': item.balance.balance >= 0, 'negative': item.balance.balance < 0 }">
                {{ formatCurrency(item.balance.balance) }}
              </span>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="card-footer">
            <span class="view-details">Voir les détails →</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredItems.length === 0 && searchQuery" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Aucun compte trouvé</h3>
        <p>Essayez de modifier votre recherche</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des comptes...</p>
      </div>
    </div>
  </div>
</template>

<script>
import * as fonction from '../js/fonction.js';
import { useRouter } from 'vue-router';
const router = useRouter()

export default {
  data() {
    return {
      items: [],
      searchQuery: '',
      isLoading: true
    };
  },
  computed: {
    filteredItems() {
      const query = this.searchQuery.toLowerCase();
      return this.items.filter(item =>
        item.Value.toLowerCase().includes(query) ||
        item.Name.toLowerCase().includes(query)
      );
    }
  },
  methods: {
    async chargerCompte(){
      try {
        this.isLoading = true;
        const token = sessionStorage.getItem('authToken');
        const compte = await fonction.getIDempiereModels(token,'c_elementvalue');
        const comptebalance = [];
        const listedescomptes = compte.records;

        for (const compteunique of listedescomptes) {
          const balance = await fonction.getBalancefromidcompte(token, compteunique.id);
          comptebalance.push({
            ...compteunique,
            balance
          });
        }
        this.items = comptebalance;
        console.log("listecompte", comptebalance);
        console.log(compte);
      } catch (error) {
        console.error('Erreur lors du chargement des comptes:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    handleButtonClick(item) {
      sessionStorage.setItem('compte', item.id);
      sessionStorage.setItem('Nomcompte', item.Name);
      this.$router.push('/livreCompte');
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(value || 0);
    }
  },
  
  mounted() {
    this.chargerCompte();
  },
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Header Section */
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
  text-align: center;
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.title-icon {
  font-size: 2rem;
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  top: -1rem;
}

/* Search Section */
.search-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #64748b;
  font-size: 1.2rem;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  font-size: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.3s ease;
  outline: none;
}

.search-input:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-clear {
  position: absolute;
  right: 1rem;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.search-clear:hover {
  background: #f1f5f9;
  color: #475569;
}

.results-count {
  margin-top: 0.75rem;
  color: #64748b;
  font-size: 0.9rem;
}

/* Accounts Grid */
.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.account-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.account-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.account-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.account-card:hover::before {
  transform: scaleX(1);
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.account-number {
  background: #f1f5f9;
  color: #475569;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 600;
  font-size: 0.9rem;
}

.balance-indicator {
  font-size: 1.5rem;
}

.balance-indicator.positive {
  filter: hue-rotate(120deg);
}

.balance-indicator.negative {
  filter: hue-rotate(-60deg);
}

/* Account Name */
.account-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
  line-height: 1.4;
}

/* Balance Details */
.balance-details {
  white-space: 0.75rem;
}

.balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.balance-row .label {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

.balance-row .value {
  font-weight: 600;
  font-family: 'Monaco', 'Consolas', monospace;
}

.balance-row .value.debit {
  color: #dc2626;
}

.balance-row .value.credit {
  color: #059669;
}

.balance-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 1rem 0;
}

.final-balance {
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 1rem !important;
}

.final-balance .label {
  font-weight: 600;
  color: #374151;
}

.final-balance .value.positive {
  color: #059669;
}

.final-balance .value.negative {
  color: #dc2626;
}

/* Card Footer */
.card-footer {
  text-align: center;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.view-details {
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 500;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.account-card:hover .view-details {
  opacity: 1;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #374151;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
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

/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .accounts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .account-card {
    padding: 1.25rem;
  }
  
  .header-content {
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .balance-indicator {
    align-self: flex-end;
  }
}
</style>