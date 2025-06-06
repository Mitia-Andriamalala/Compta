<template>
  <div class="account-book-app">
    <!-- En-tête principal -->
    <div class="main-header">
      <div class="header-content">
        <div class="title-section">
          <div class="icon-wrapper">
            <i class="fas fa-book-open"></i>
          </div>
          <div class="title-info">
            <h1 class="main-title">Livre de Compte</h1>
            <p class="account-subtitle">{{ nomCompte }}</p>
          </div>
        </div>
        
        <!-- Filtres de date modernisés -->
        <div class="filters-section">
          <div class="date-filter-card">
            <div class="filter-group">
              <label class="modern-label">
                <i class="fas fa-calendar-alt"></i>
                Période
              </label>
              <div class="date-range-inputs">
                <div class="date-input-wrapper">
                  <input 
                    type="date" 
                    v-model="dateDebut" 
                    class="modern-date-input"
                    placeholder="Date de début"
                  >
                  <span class="input-label">Début</span>
                </div>
                <div class="date-separator">
                  <i class="fas fa-arrow-right"></i>
                </div>
                <div class="date-input-wrapper">
                  <input 
                    type="date" 
                    v-model="dateFin" 
                    class="modern-date-input"
                    placeholder="Date de fin"
                  >
                  <span class="input-label">Fin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Indicateurs de performance -->
    <div class="metrics-dashboard" v-if="!loading && transactions.length > 0">
      <div class="metric-card">
        <div class="metric-icon debit">
          <i class="fas fa-arrow-down"></i>
        </div>
        <div class="metric-content">
          <h3 class="metric-value">{{ formatCurrency(totalDebits()) }}</h3>
          <p class="metric-label">Total Débits</p>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon credit">
          <i class="fas fa-arrow-up"></i>
        </div>
        <div class="metric-content">
          <h3 class="metric-value">{{ formatCurrency(totalCredits()) }}</h3>
          <p class="metric-label">Total Crédits</p>
        </div>
      </div>
      
      <div class="metric-card balance" :class="getBalanceClass()">
        <div class="metric-icon">
          <i class="fas fa-balance-scale"></i>
        </div>
        <div class="metric-content">
          <h3 class="metric-value">{{ formatCurrency(grandTotalBalance()) }}</h3>
          <p class="metric-label">Solde Net</p>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon transactions">
          <i class="fas fa-list-ul"></i>
        </div>
        <div class="metric-content">
          <h3 class="metric-value">{{ transactionsFiltrées.length }}</h3>
          <p class="metric-label">Transactions</p>
        </div>
      </div>
    </div>

    <!-- États de chargement et vide -->
    <div v-if="loading" class="loading-state">
      <div class="loading-animation">
        <div class="loading-spinner"></div>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <p class="loading-text">Chargement des données...</p>
    </div>

    <div v-if="!loading && transactions.length === 0" class="empty-state">
      <div class="empty-illustration">
        <i class="fas fa-file-invoice"></i>
      </div>
      <h3 class="empty-title">Aucune transaction trouvée</h3>
      <p class="empty-description">Il n'y a pas de transactions pour la période sélectionnée.</p>
    </div>

    <!-- Tableau des transactions modernisé -->
    <div class="transactions-section" v-if="!loading && transactions.length > 0">
      <div class="section-header">
        <h2 class="section-title">
          <i class="fas fa-table"></i>
          Détail des Transactions
        </h2>
        <div class="export-actions">
          <button class="export-btn" @click="exportToPDF">
            <i class="fas fa-file-pdf"></i>
            PDF
          </button>
          <button class="export-btn" @click="exportToExcel">
            <i class="fas fa-file-excel"></i>
            Excel
          </button>
        </div>
      </div>

      <div class="table-card">
        <div class="table-wrapper">
          <table class="modern-table">
            <thead>
              <tr>
                <th class="sortable" @click="sortBy('date')">
                  <span>Date</span>
                  <i :class="['fas', sortField === 'date' ? sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down' : 'fa-sort']"></i>
                </th>
                <th class="sortable" @click="sortBy('reference')">
                  <span>Référence</span>
                  <i :class="['fas', sortField === 'reference' ? sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down' : 'fa-sort']"></i>
                </th>
                <th class="amount-header">
                  <span>Débit</span>
                </th>
                <th class="amount-header">
                  <span>Crédit</span>
                </th>
                <th class="amount-header">
                  <span>Solde</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(transaction, index) in transactionsFiltrées" :key="index">
                <!-- Lignes de transaction -->
                <tr 
                  v-for="(transactionline, lineIndex) in transaction.gl_journalline" 
                  :key="`${index}-${lineIndex}`"
                  class="transaction-row"
                  :class="{ 'row-alt': (index + lineIndex) % 2 === 1 }"
                >
                  <td class="date-cell">
                    <div class="date-display">
                      <i class="fas fa-calendar date-icon"></i>
                      {{ formatDate(transactionline.DateAcct) }}
                    </div>
                  </td>
                  <td class="reference-cell">
                    <div class="reference-badge">
                      {{ transaction.DocumentNo }}
                    </div>
                  </td>
                  <td class="amount-cell">
                    <span :class="getAmountClass(transactionline.AmtSourceDr)">
                      {{ formatCurrency(transactionline.AmtSourceDr) }}
                    </span>
                  </td>
                  <td class="amount-cell">
                    <span :class="getAmountClass(transactionline.AmtSourceCr)">
                      {{ formatCurrency(transactionline.AmtSourceCr) }}
                    </span>
                  </td>
                  <td class="amount-cell balance-cell">
                    <span :class="getAmountClass(transactionline.AmtSourceDr - transactionline.AmtSourceCr)">
                      {{ formatCurrency(transactionline.AmtSourceDr - transactionline.AmtSourceCr) }}
                    </span>
                  </td>
                </tr>
                
                <!-- Ligne de total par journal -->
                <tr class="journal-total-row">
                  <td colspan="2" class="total-label-cell">
                    <div class="total-badge">
                      <i class="fas fa-calculator"></i>
                      Total Journal
                    </div>
                  </td>
                  <td class="total-amount-cell">
                    <strong>{{ formatCurrency(totalDebit(transaction)) }}</strong>
                  </td>
                  <td class="total-amount-cell">
                    <strong>{{ formatCurrency(totalCredit(transaction)) }}</strong>
                  </td>
                  <td class="total-amount-cell balance-cell">
                    <strong :class="getAmountClass(totalDebit(transaction) - totalCredit(transaction))">
                      {{ formatCurrency(totalDebit(transaction) - totalCredit(transaction)) }}
                    </strong>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        
        <!-- Solde final -->
        <div class="final-balance-section">
          <div class="balance-card" :class="getBalanceClass()">
            <div class="balance-icon">
              <i class="fas fa-coins"></i>
            </div>
            <div class="balance-content">
              <p class="balance-label">Solde Final</p>
              <h2 class="balance-amount">{{ formatCurrency(grandTotalBalance()) }}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as fonction from '../js/fonction.js';

export default {
  data() {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    
    return {
      dateDebut: firstDayOfMonth,
      dateFin: today,
      transactions: [],
      journal: [],
      loading: true,
      compte: sessionStorage.getItem('compte'),
      nomCompte: sessionStorage.getItem('Nomcompte'),
      sortField: '',
      sortDirection: 'asc'
    };
  },
  mounted() {
    this.fetchTransactions();
  },
  computed: {
    transactionsFiltrées() {
      let filtered = this.transactions;
      if (this.dateDebut || this.dateFin) {
        const debut = this.dateDebut || "0000-01-01";
        const fin = this.dateFin || "9999-12-31";
        filtered = filtered.filter(transaction => {
          return transaction.gl_journalline.some(line => 
            line.DateAcct >= debut && line.DateAcct <= fin
          );
        });
      }

      if (this.sortField) {
        filtered = [...filtered].sort((a, b) => {
          let valueA, valueB;
          if (this.sortField === 'date') {
            valueA = a.gl_journalline[0]?.DateAcct || '';
            valueB = b.gl_journalline[0]?.DateAcct || '';
          } else if (this.sortField === 'reference') {
            valueA = a.DocumentNo || '';
            valueB = b.DocumentNo || '';
          }
          if (this.sortDirection === 'asc') {
            return valueA > valueB ? 1 : -1;
          } else {
            return valueA < valueB ? 1 : -1;
          }
        });
      }
      return filtered;
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    formatCurrency(amount) {
      if (amount === null || amount === undefined || amount === 0) return '0,00 €';
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    },
    getAmountClass(amount) {
      if (amount < 0) return 'amount-negative';
      if (amount > 0) return 'amount-positive';
      return 'amount-zero';
    },
    getBalanceClass() {
      const balance = this.grandTotalBalance();
      if (balance < 0) return 'negative-balance';
      if (balance > 0) return 'positive-balance';
      return 'neutral-balance';
    },
    totalDebit(transaction) {
      return transaction.gl_journalline.reduce((sum, line) => sum + Number(line.AmtSourceDr || 0), 0);
    },
    totalCredit(transaction) {
      return transaction.gl_journalline.reduce((sum, line) => sum + Number(line.AmtSourceCr || 0), 0);
    },
    totalDebits() {
      return this.transactionsFiltrées.reduce((sum, transaction) => {
        return sum + this.totalDebit(transaction);
      }, 0);
    },
    totalCredits() {
      return this.transactionsFiltrées.reduce((sum, transaction) => {
        return sum + this.totalCredit(transaction);
      }, 0);
    },
    grandTotalBalance() {
      return this.totalDebits() - this.totalCredits();
    },
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
    },
    exportToPDF() {
      // Placeholder for PDF export implementation
      console.log('Exporting to PDF...');
      // Implement PDF generation logic here (e.g., using jsPDF)
    },
    exportToExcel() {
      // Placeholder for Excel export implementation
      console.log('Exporting to Excel...');
      // Implement Excel export logic here (e.g., using SheetJS)
    },
    async fetchTransactions() {
      try {
        const token = sessionStorage.getItem('authToken');
        const transactionsData = await fonction.getIDempiereModelJoin(
          token, 
          'gl_journal', 
          'gl_journalline', 
          'account_id', 
          this.compte
        );
        
        this.transactions = transactionsData.records.filter(t => t.gl_journalline);
        this.journal = await fonction.getIDempiereModels(token, 'gl_journal');
      } catch (error) {
        console.error("Erreur lors du chargement des transactions:", error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

* {
  box-sizing: border-box;
}

.account-book-app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 0;
  margin: 0;
}

/* En-tête principal */
.main-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  background: rgba(255,255,255,0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.icon-wrapper i {
  font-size: 1.5rem;
  color: white;
}

.title-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.main-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
}

.account-subtitle {
  font-size: 1.1rem;
  font-weight: 400;
  margin: 0;
  opacity: 0.9;
}

/* Filtres de date */
.filters-section {
  display: flex;
  gap: 1rem;
}

.date-filter-card {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255,255,255,0.2);
}

.modern-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.date-range-inputs {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.date-input-wrapper {
  position: relative;
}

.modern-date-input {
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: #333;
  min-width: 140px;
  transition: all 0.2s ease;
}

.modern-date-input:focus {
  outline: none;
  border-color: rgba(255,255,255,0.8);
  box-shadow: 0 0 0 3px rgba(255,255,255,0.2);
}

.input-label {
  position: absolute;
  bottom: -1.5rem;
  left: 0;
  font-size: 0.75rem;
  opacity: 0.8;
}

.date-separator {
  color: rgba(255,255,255,0.8);
  font-size: 0.9rem;
}

/* Tableau de bord des métriques */
.metrics-dashboard {
  max-width: 1400px;
  margin: -2rem auto 2rem;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  z-index: 10;
  position: relative;
}

.metric-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.8);
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0,0,0,0.12);
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.metric-icon.debit {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
}

.metric-icon.credit {
  background: linear-gradient(135deg, #51cf66, #40c057);
}

.metric-icon {
  background: linear-gradient(135deg, #339af0, #228be6);
}

.metric-icon.transactions {
  background: linear-gradient(135deg, #9775fa, #845ef7);
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: #1a1a1a;
}

.metric-label {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  font-weight: 500;
}

.balance.positive-balance .metric-icon {
  background: linear-gradient(135deg, #51cf66, #40c057);
}

.balance.negative-balance .metric-icon {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
}

/* États de chargement */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(102, 126, 234, 0.1);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-dots {
  display: flex;
  gap: 0.5rem;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: bounce 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

.loading-text {
  font-size: 1.1rem;
  color: #666;
  font-weight: 500;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* État vide */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 500px;
  margin: 0 auto;
}

.empty-illustration {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #f1f3f4, #e8eaed);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
}

.empty-illustration i {
  font-size: 3rem;
  color: #9aa0a6;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

.empty-description {
  font-size: 1rem;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

/* Section des transactions */
.transactions-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.export-actions {
  display: flex;
  gap: 0.75rem;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn:hover {
  background: #f8f9fa;
  border-color: #667eea;
  color: #667eea;
}

/* Tableau moderne */
.table-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.8);
}

.table-wrapper {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table thead {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.modern-table th {
  padding: 1.25rem 1.5rem;
  text-align: left;
  font-weight: 600;
  color: white;
  font-size: 0.9rem;
  letter-spacing: 0.025em;
  border: none;
}

.modern-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.modern-table th.sortable:hover {
  background: rgba(255,255,255,0.1);
}

.modern-table th span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-icon {
  opacity: 0.6;
  font-size: 0.8rem;
}

.amount-header {
  text-align: right;
}

.modern-table tbody tr {
  border-bottom: 1px solid #f1f3f4;
  transition: background-color 0.2s ease;
}

.transaction-row:hover {
  background: rgba(102, 126, 234, 0.02);
}

.row-alt {
  background: #fafbfc;
}

.modern-table td {
  padding: 1rem 1.5rem;
  vertical-align: middle;
  border: none;
}

.date-cell {
  width: 150px;
}

.date-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.date-icon {
  color: #667eea;
  font-size: 0.9rem;
}

.reference-cell {
  width: 180px;
}

.reference-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-block;
}

.amount-cell {
  text-align: right;
  width: 150px;
  font-weight: 500;
}

.amount-positive {
  color: #2e7d32;
}

.amount-negative {
  color: #d32f2f;
}

.amount-zero {
  color: #757575;
}

.balance-cell {
  font-weight: 600;
}

/* Ligne de total journal */
.journal-total-row {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef) !important;
  border-top: 2px solid #dee2e6;
  border-bottom: 2px solid #dee2e6;
}

.total-label-cell {
  font-weight: 600;
}

.total-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #495057;
  font-weight: 600;
}

.total-amount-cell {
  text-align: right;
  font-weight: 600;
  color: #333;
}

/* Section solde final */
.final-balance-section {
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-top: 1px solid #dee2e6;
}

.balance-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  max-width: 400px;
  margin: 0 auto;
}

.balance-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.positive-balance .balance-icon {
  background: linear-gradient(135deg, #51cf66, #40c057);
}

.negative-balance .balance-icon {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
}

.balance-content {
  text-align: center;
}

.balance-label {
  font-size: 1rem;
  color: #666;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.balance-amount {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #333;
}

.positive-balance .balance-amount {
  color: #2e7d32;
}

.negative-balance .balance-amount {
  color: #d32f2f;
}

/* Responsive */
@media (max-width: 1200px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .metrics-dashboard {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    margin-top: 2rem;
  }

  .modern-table th,
  .modern-table td {
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
  }

  .date-cell,
  .reference-cell,
  .amount-cell {
    width: auto;
  }
}

@media (max-width: 768px) {
  .date-range-inputs {
    flex-direction: column;
    gap: 0.5rem;
  }

  .date-input-wrapper {
    width: 100%;
  }

  .modern-date-input {
    width: 100%;
  }

  .date-separator {
    display: none;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .export-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}
</style>