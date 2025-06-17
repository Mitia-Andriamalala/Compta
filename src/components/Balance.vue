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
      <!-- Totaux par Classe Section -->
      <div class="class-totals-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">📊</span>
            Totaux par Classe de Comptes
          </h2>
          <div class="section-subtitle">
            Répartition des soldes selon le plan comptable général
          </div>
        </div>
        
        <div class="class-grid">
          <div 
            v-for="(classData, className) in classTotals" 
            :key="className"
            class="class-card"
            :class="getClassCardType(className)"
            @click="toggleClassDetails(className)"
          >
            <div class="class-header">
              <div class="class-info">
                <span class="class-number">{{ className }}</span>
                <span class="class-name">{{ getClassLabel(className) }}</span>
              </div>
              <div class="class-actions">
                <div class="class-icon">{{ getClassIcon(className) }}</div>
                <div class="expand-icon" :class="{ 'expanded': expandedClass === className }">
                  {{ expandedClass === className ? '▼' : '▶' }}
                </div>
              </div>
            </div>
            
            <div class="class-stats">
              <div class="stat-item">
                <span class="stat-label">Comptes</span>
                <span class="stat-value">{{ classData.count }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Débit</span>
                <span class="stat-value debit">{{ formatCurrency(classData.totalDebit) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Crédit</span>
                <span class="stat-value credit">{{ formatCurrency(classData.totalCredit) }}</span>
              </div>
            </div>
            
            <div class="class-balance">
              <div class="balance-label">Solde de Classe</div>
              <div class="balance-amount" :class="{ 'positive': classData.balance >= 0, 'negative': classData.balance < 0 }">
                {{ formatCurrency(classData.balance) }}
              </div>
            </div>
            
            <div class="class-accounts">
              <div class="accounts-preview">
                <span v-for="account in classData.accounts.slice(0, 3)" :key="account.id" class="account-preview">
                  {{ account.Value }}
                </span>
                <span v-if="classData.accounts.length > 3" class="more-accounts">
                  +{{ classData.accounts.length - 3 }} autres
                </span>
              </div>
            </div>
            
            <div class="class-actions-footer">
              <button @click.stop="viewClassChart(className)" class="chart-link-btn">
                📈 Voir Graphiques
              </button>
              <div class="click-hint">
                Cliquer pour voir les détails
              </div>
            </div>
          </div>
        </div>
        
        <!-- Détails de la Classe Expandue -->
        <div v-if="expandedClass" class="class-details-section">
          <div class="details-header">
            <h3 class="details-title">
              <span class="details-icon">{{ getClassIcon(expandedClass) }}</span>
              Détails - Classe {{ expandedClass }} : {{ getClassLabel(expandedClass) }}
            </h3>
            <button @click="closeClassDetails" class="close-details-btn">
              <span>✕</span>
            </button>
          </div>
          
          <div class="details-summary">
            <div class="summary-stats">
              <div class="summary-stat">
                <span class="stat-icon">📊</span>
                <span class="stat-text">{{ classTotals[expandedClass].count }} comptes</span>
              </div>
              <div class="summary-stat">
                <span class="stat-icon">📉</span>
                <span class="stat-text">{{ formatCurrency(classTotals[expandedClass].totalDebit) }} de débits</span>
              </div>
              <div class="summary-stat">
                <span class="stat-icon">📈</span>
                <span class="stat-text">{{ formatCurrency(classTotals[expandedClass].totalCredit) }} de crédits</span>
              </div>
              <div class="summary-stat">
                <span class="stat-icon">💰</span>
                <span class="stat-text">{{ formatCurrency(classTotals[expandedClass].balance) }} de solde</span>
              </div>
            </div>
          </div>
          
          <div class="accounts-table-container">
            <table class="accounts-table">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Nom du Compte</th>
                  <th>Total Débit</th>
                  <th>Total Crédit</th>
                  <th>Solde</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="account in classTotals[expandedClass].accounts" 
                  :key="account.id"
                  class="account-row"
                  :class="{ 'positive-balance': account.balance.balance >= 0, 'negative-balance': account.balance.balance < 0 }"
                >
                  <td class="account-number-cell">
                    <span class="account-badge">{{ account.Value }}</span>
                  </td>
                  <td class="account-name-cell">
                    <div class="account-name-content">
                      <span class="account-name-text">{{ account.Name }}</span>
                    </div>
                  </td>
                  <td class="amount-cell debit">
                    {{ formatCurrency(account.balance.totalDebit) }}
                  </td>
                  <td class="amount-cell credit">
                    {{ formatCurrency(account.balance.totalCredit) }}
                  </td>
                  <td class="amount-cell balance" :class="{ 'positive': account.balance.balance >= 0, 'negative': account.balance.balance < 0 }">
                    <span class="balance-indicator-small">
                      {{ account.balance.balance >= 0 ? '↗' : '↘' }}
                    </span>
                    {{ formatCurrency(account.balance.balance) }}
                  </td>
                  <td class="actions-cell">
                    <button @click="handleButtonClick(account)" class="view-account-btn">
                      👁️ Voir
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="totals-row">
                  <td colspan="2" class="totals-label">
                    <strong>Total Classe {{ expandedClass }}</strong>
                  </td>
                  <td class="amount-cell debit total">
                    <strong>{{ formatCurrency(classTotals[expandedClass].totalDebit) }}</strong>
                  </td>
                  <td class="amount-cell credit total">
                    <strong>{{ formatCurrency(classTotals[expandedClass].totalCredit) }}</strong>
                  </td>
                  <td class="amount-cell balance total" :class="{ 'positive': classTotals[expandedClass].balance >= 0, 'negative': classTotals[expandedClass].balance < 0 }">
                    <strong>{{ formatCurrency(classTotals[expandedClass].balance) }}</strong>
                  </td>
                  <td class="actions-cell"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <!-- Résumé Global -->
        <div class="global-summary">
          <div class="summary-card">
            <h3 class="summary-title">Résumé Global</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">Total Comptes</span>
                <span class="summary-value">{{ items.length }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Total Débit</span>
                <span class="summary-value debit">{{ formatCurrency(globalTotals.totalDebit) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Total Crédit</span>
                <span class="summary-value credit">{{ formatCurrency(globalTotals.totalCredit) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Différence</span>
                <span class="summary-value" :class="{ 'positive': globalTotals.difference >= 0, 'negative': globalTotals.difference < 0 }">
                  {{ formatCurrency(globalTotals.difference) }}
                </span>
              </div>
            </div>
            
            <!-- Lien vers page globale des graphiques -->
            <div class="global-chart-link">
              <button @click="viewAllCharts" class="global-chart-btn">
                📊 Voir Tous les Graphiques
              </button>
            </div>
          </div>
        </div>
      </div>

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
        <div class="filter-tabs">
          <button 
            v-for="(filter, key) in classFilters" 
            :key="key"
            @click="selectedClassFilter = key"
            :class="{ 'active': selectedClassFilter === key }"
            class="filter-tab"
          >
            {{ filter.label }} ({{ filter.count }})
          </button>
        </div>
        <div class="results-count" v-if="searchQuery || selectedClassFilter !== 'all'">
          {{ filteredItems.length }} résultat(s) affiché(s)
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
            <div class="account-info">
              <div class="account-number">{{ item.Value }}</div>
              <div class="account-class">Classe {{ getAccountClass(item.Value) }}</div>
            </div>
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
      <div v-if="filteredItems.length === 0 && (searchQuery || selectedClassFilter !== 'all')" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Aucun compte trouvé</h3>
        <p>Essayez de modifier votre recherche ou vos filtres</p>
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
      selectedClassFilter: 'all',
      expandedClass: null,
      isLoading: true
    };
  },
  computed: {
    // Calcul des totaux par classe
    classTotals() {
      const classes = {};
      
      this.items.forEach(item => {
        const accountClass = this.getAccountClass(item.Value);
        
        if (!classes[accountClass]) {
          classes[accountClass] = {
            count: 0,
            totalDebit: 0,
            totalCredit: 0,
            balance: 0,
            accounts: []
          };
        }
        
        classes[accountClass].count++;
        classes[accountClass].totalDebit += item.balance.totalDebit || 0;
        classes[accountClass].totalCredit += item.balance.totalCredit || 0;
        classes[accountClass].balance += item.balance.balance || 0;
        classes[accountClass].accounts.push(item);
      });
      
      return classes;
    },
    
    // Calcul des totaux globaux
    globalTotals() {
      const totals = {
        totalDebit: 0,
        totalCredit: 0,
        difference: 0
      };
      
      this.items.forEach(item => {
        totals.totalDebit += item.balance.totalDebit || 0;
        totals.totalCredit += item.balance.totalCredit || 0;
      });
      
      totals.difference = totals.totalDebit - totals.totalCredit;
      
      return totals;
    },
    
    // Filtres par classe
    classFilters() {
      const filters = {
        all: { label: 'Tous', count: this.items.length }
      };
      
      Object.keys(this.classTotals).forEach(classNumber => {
        const classData = this.classTotals[classNumber];
        filters[classNumber] = {
          label: `Classe ${classNumber}`,
          count: classData.count
        };
      });
      
      return filters;
    },
    
    filteredItems() {
      let filtered = this.items;
      
      // Filtre par recherche
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(item =>
          item.Value.toLowerCase().includes(query) ||
          item.Name.toLowerCase().includes(query)
        );
      }
      
      // Filtre par classe
      if (this.selectedClassFilter !== 'all') {
        filtered = filtered.filter(item => 
          this.getAccountClass(item.Value) === this.selectedClassFilter
        );
      }
      
      return filtered;
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
        console.log("Totaux par classe:", this.classTotals);
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
    },
    
    // Déterminer la classe d'un compte
    getAccountClass(accountNumber) {
      if (!accountNumber) return 'N/A';
      return accountNumber.toString().charAt(0);
    },
    
    // Obtenir le libellé de la classe
    getClassLabel(classNumber) {
      const labels = {
        '1': 'Comptes de Capitaux',
        '2': 'Comptes d\'Immobilisations',
        '3': 'Comptes de Stocks',
        '4': 'Comptes de Tiers',
        '5': 'Comptes Financiers',
        '6': 'Comptes de Charges',
        '7': 'Comptes de Produits',
        '8': 'Comptes Spéciaux'
      };
      return labels[classNumber] || 'Classe Inconnue';
    },
    
    // Obtenir l'icône de la classe
    getClassIcon(classNumber) {
      const icons = {
        '1': '🏛️',
        '2': '🏗️',
        '3': '📦',
        '4': '🤝',
        '5': '💰',
        '6': '📉',
        '7': '📈',
        '8': '⚙️'
      };
      return icons[classNumber] || '📊';
    },
    
    // Déterminer le type de carte de classe
    getClassCardType(classNumber) {
      return `class-${classNumber}`;
    },
    
    // Basculer l'affichage des détails d'une classe
    toggleClassDetails(className) {
      if (this.expandedClass === className) {
        this.expandedClass = null;
      } else {
        this.expandedClass = className;
        // Scroll vers la section des détails
        this.$nextTick(() => {
          const detailsSection = document.querySelector('.class-details-section');
          if (detailsSection) {
            detailsSection.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        });
      }
    },
    
    // Fermer les détails de classe
    closeClassDetails() {
      this.expandedClass = null;
    },
    
    // Voir les graphiques d'une classe spécifique
    viewClassChart(className) {
      // Sauvegarder les données de la classe dans sessionStorage
      sessionStorage.setItem('selectedClass', className);
      sessionStorage.setItem('classData', JSON.stringify(this.classTotals[className]));
      sessionStorage.setItem('allAccountsData', JSON.stringify(this.items));
      
      // Naviguer vers la page des graphiques
      this.$router.push({
        path: '/graphiques',
        query: { 
          classe: className,
          nom: this.getClassLabel(className)
        }
      });
    },
    
    // Voir tous les graphiques
    viewAllCharts() {
      // Sauvegarder toutes les données dans sessionStorage
      sessionStorage.setItem('allClassTotals', JSON.stringify(this.classTotals));
      sessionStorage.setItem('allAccountsData', JSON.stringify(this.items));
      sessionStorage.setItem('globalTotals', JSON.stringify(this.globalTotals));
      
      // Naviguer vers la page des graphiques globaux
      this.$router.push({
        path: '/graphiques',
        query: { 
          vue: 'global'
        }
      });
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

/* Class Totals Section */
.class-totals-section {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.section-icon {
  font-size: 1.5rem;
}

.section-subtitle {
  color: #64748b;
  font-size: 1rem;
}

.class-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.class-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.class-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.class-card.class-1::before { background: linear-gradient(90deg, #3b82f6, #1d4ed8); }
.class-card.class-2::before { background: linear-gradient(90deg, #10b981, #047857); }
.class-card.class-3::before { background: linear-gradient(90deg, #f59e0b, #d97706); }
.class-card.class-4::before { background: linear-gradient(90deg, #8b5cf6, #7c3aed); }
.class-card.class-5::before { background: linear-gradient(90deg, #06b6d4, #0891b2); }
.class-card.class-6::before { background: linear-gradient(90deg, #ef4444, #dc2626); }
.class-card.class-7::before { background: linear-gradient(90deg, #22c55e, #16a34a); }
.class-card.class-8::before { background: linear-gradient(90deg, #6b7280, #4b5563); }

.class-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.class-card:hover::before {
  transform: scaleX(1);
}

.class-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.expand-icon {
  font-size: 1.2rem;
  color: #64748b;
  transition: all 0.3s ease;
  cursor: pointer;
}

.expand-icon.expanded {
  transform: rotate(0deg);
  color: #667eea;
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.class-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.class-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.class-name {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.class-icon {
  font-size: 2rem;
  opacity: 0.7;
}

.class-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: 'Monaco', 'Consolas', monospace;
}

.stat-value.debit { color: #dc2626; }
.stat-value.credit { color: #059669; }

.class-balance {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  margin-bottom: 1rem;
}

.balance-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.balance-amount {
  font-size: 1.25rem;
  font-weight: 700;
  font-family: 'Monaco', 'Consolas', monospace;
}

.balance-amount.positive { color: #059669; }
.balance-amount.negative { color: #dc2626; }

.class-accounts {
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
}

.accounts-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.account-preview {
  background: #f1f5f9;
  color: #475569;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 600;
}

.more-accounts {
  background: #e2e8f0;
  color: #64748b;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-style: italic;
}

.click-hint {
  text-align: center;
  font-size: 0.8rem;
  color: #64748b;
  font-style: italic;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.class-card:hover .click-hint {
  opacity: 1;
}

.class-card:hover {
  cursor: pointer;
}

.class-actions-footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.chart-link-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.chart-link-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Class Details Section */
.class-details-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-top: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 2px solid #667eea;
  animation: slideDown 0.4s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.details-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.details-icon {
  font-size: 1.8rem;
}

.close-details-btn {
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #64748b;
}

.close-details-btn:hover {
  background: #e2e8f0;
  color: #374151;
  transform: scale(1.1);
}

.details-summary {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-stat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
}

/* Accounts Table */
.accounts-table-container {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.accounts-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.accounts-table th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
}

.accounts-table th:first-child {
  border-top-left-radius: 12px;
}

.accounts-table th:last-child {
  border-top-right-radius: 12px;
}

.account-row {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
}

.account-row:hover {
  background: #f8fafc;
  transform: scale(1.01);
}

.accounts-table td {
  padding: 1rem;
  font-size: 0.9rem;
  border: none;
}

.account-number-cell {
  width: 120px;
}

.account-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 600;
  font-size: 0.85rem;
}

.account-name-cell {
  max-width: 250px;
}

.account-name-content {
  display: flex;
  flex-direction: column;
}

.account-name-text {
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}

.amount-cell {
  text-align: right;
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 600;
  width: 120px;
}

.amount-cell.debit {
  color: #dc2626;
}

.amount-cell.credit {
  color: #059669;
}

.amount-cell.balance.positive {
  color: #059669;
}

.amount-cell.balance.negative {
  color: #dc2626;
}

.balance-indicator-small {
  margin-right: 0.5rem;
  font-size: 0.9rem;
}

.actions-cell {
  width: 100px;
  text-align: center;
}

.view-account-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.view-account-btn:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

/* Table Footer */
.totals-row {
  background: #f8fafc;
  border-top: 2px solid #e2e8f0;
}

.totals-row td {
  padding: 1.25rem 1rem;
  font-size: 1rem;
}

.totals-label {
  color: #374151;
}

.amount-cell.total {
  font-size: 1.1rem;
}

/* Global Summary */
.global-summary {
  margin-top: 2rem;
}

.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  padding: 2rem;
}

.summary-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 12px;
}

.summary-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.summary-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  font-family: 'Monaco', 'Consolas', monospace;
}

.summary-value.debit { color: #fca5a5; }
.summary-value.credit { color: #86efac; }
.summary-value.positive { color: #86efac; }
.summary-value.negative { color: #fca5a5; }

.global-chart-link {
  margin-top: 1.5rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.global-chart-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.global-chart-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
  margin-bottom: 1rem;
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

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filter-tab {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  color: #64748b;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.filter-tab.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.results-count {
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

.account-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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

.account-class {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
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
  margin-bottom: 0.75rem;
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
@media (max-width: 1024px) {
  .class-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
  
  .class-stats {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .summary-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .summary-stats {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
  
  .accounts-table-container {
    overflow-x: scroll;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .class-totals-section {
    padding: 1.5rem;
  }
  
  .class-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
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
  
  .filter-tabs {
    justify-content: center;
  }
  
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
  
  .class-details-section {
    padding: 1.5rem;
  }
  
  .accounts-table th,
  .accounts-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
  }
  
  .account-name-cell {
    max-width: 150px;
  }
  
  .amount-cell {
    width: 100px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .section-title {
    font-size: 1.5rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .class-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .class-actions {
    align-self: flex-end;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .balance-indicator {
    align-self: flex-end;
  }
  
  .filter-tabs {
    flex-direction: column;
  }
  
  .filter-tab {
    text-align: center;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .details-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .close-details-btn {
    align-self: flex-end;
  }
  
  .details-title {
    font-size: 1.25rem;
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .accounts-table {
    font-size: 0.8rem;
  }
  
  .accounts-table th,
  .accounts-table td {
    padding: 0.5rem 0.25rem;
  }
  
  .account-badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
  
  .view-account-btn {
    padding: 0.4rem 0.6rem;
    font-size: 0.75rem;
  }
}

/* Animation pour les cartes de classe */
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

.class-card {
  animation: fadeInUp 0.6s ease-out forwards;
}

.class-card:nth-child(1) { animation-delay: 0.1s; }
.class-card:nth-child(2) { animation-delay: 0.2s; }
.class-card:nth-child(3) { animation-delay: 0.3s; }
.class-card:nth-child(4) { animation-delay: 0.4s; }
.class-card:nth-child(5) { animation-delay: 0.5s; }
.class-card:nth-child(6) { animation-delay: 0.6s; }
.class-card:nth-child(7) { animation-delay: 0.7s; }
.class-card:nth-child(8) { animation-delay: 0.8s; }

/* Focus states */
.form-input:focus,
.form-select:focus,
.btn:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .page-header,
  .header-actions,
  .btn,
  .chart-link-btn,
  .global-chart-btn {
    display: none !important;
  }
  
  .section-card {
    box-shadow: none;
    border: 1px solid #000;
  }
  
  .accounts-table {
    font-size: 0.8rem;
  }
}
</style>