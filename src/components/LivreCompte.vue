<template>
  <div class="account-book-container">
    <div class="header-section">
      <h1 class="account-title">Livre de compte: <span class="account-name">{{ nomCompte }}</span></h1>
      <div class="date-filters">
        <div class="date-input-group">
          <label for="dateDebut" class="date-label">Date début :</label>
          <input type="date" v-model="dateDebut" id="dateDebut" class="date-input">
        </div>
        <div class="date-input-group">
          <label for="dateFin" class="date-label">Date fin :</label>
          <input type="date" v-model="dateFin" id="dateFin" class="date-input">
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <span>Chargement des données...</span>
    </div>

    <div v-if="!loading && transactions.length === 0" class="empty-state">
      <i class="fas fa-file-alt empty-icon"></i>
      <p>Aucune transaction trouvée pour cette période.</p>
    </div>

    <div class="table-container" v-if="!loading && transactions.length > 0">
      <table class="transaction-table">
        <thead>
          <tr>
            <th class="date-col">Date</th>
            <th class="ref-col">Référence journal</th>
            <th class="amount-col">Débit</th>
            <th class="amount-col">Crédit</th>
            <th class="amount-col">Solde</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(transaction, index) in transactionsFiltrées" :key="index">
            <tr v-for="(transactionline, lineIndex) in transaction.gl_journalline" :key="lineIndex" 
                :class="{'transaction-row': true, 'even-row': lineIndex % 2 === 0}">
              <td>{{ formatDate(transactionline.DateAcct) }}</td>
              <td>{{ transaction.DocumentNo }}</td>
              <td :class="getAmountClass(transactionline.AmtSourceDr)">{{ formatCurrency(transactionline.AmtSourceDr) }}</td>
              <td :class="getAmountClass(transactionline.AmtSourceCr)">{{ formatCurrency(transactionline.AmtSourceCr) }}</td>
              <td :class="getAmountClass(transactionline.AmtSourceDr - transactionline.AmtSourceCr)">
                {{ formatCurrency(transactionline.AmtSourceDr - transactionline.AmtSourceCr) }}
              </td>
            </tr>
            <tr class="transaction-total">
              <td colspan="2" class="total-label">Total journal</td>
              <td class="total-amount">{{ formatCurrency(totalDebit(transaction)) }}</td>
              <td class="total-amount">{{ formatCurrency(totalCredit(transaction)) }}</td>
              <td :class="getAmountClass(totalDebit(transaction) - totalCredit(transaction))">
                {{ formatCurrency(totalDebit(transaction) - totalCredit(transaction)) }}
              </td>
            </tr>
          </template>
        </tbody>
        <tfoot>
          <tr class="grand-total">
            <td colspan="4" class="total-label">SOLDE FINAL</td>
            <td :class="['final-balance', getAmountClass(grandTotalBalance())]">
              <strong>{{ formatCurrency(grandTotalBalance()) }}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
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
      dateDebut: firstDayOfMonth, // Défaut: premier jour du mois
      dateFin: today,             // Défaut: aujourd'hui
      transactions: [],
      journal: [],
      loading: true,
      compte: sessionStorage.getItem('compte'),
      nomCompte: sessionStorage.getItem('Nomcompte')
    };
  },
  mounted() {
    this.fetchTransactions();
  },
  computed: {
    transactionsFiltrées() {
      if (!this.dateDebut && !this.dateFin) {
        return this.transactions;
      }

      const debut = this.dateDebut || "0000-01-01";
      const fin = this.dateFin || "9999-12-31";

      return this.transactions.filter(transaction => {
        return transaction.gl_journalline.some(line => 
          line.DateAcct >= debut && line.DateAcct <= fin
        );
      });
    },
  },
  methods: {
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('fr-FR');
    },
    formatCurrency(amount) {
      if (amount === null || amount === undefined) return '';
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    },
    getAmountClass(amount) {
      if (amount < 0) return 'negative';
      if (amount > 0) return 'positive';
      return 'zero';
    },
    totalDebit(transaction) {
      return transaction.gl_journalline.reduce((sum, line) => sum + Number(line.AmtSourceDr || 0), 0);
    },
    totalCredit(transaction) {
      return transaction.gl_journalline.reduce((sum, line) => sum + Number(line.AmtSourceCr || 0), 0);
    },
    grandTotalBalance() {
      return this.transactions.reduce((sum, transaction) => {
        return sum + (this.totalDebit(transaction) - this.totalCredit(transaction));
      }, 0);
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
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.account-book-container {
  font-family: 'Roboto', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

.header-section {
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.account-title {
  font-size: 1.8rem;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 20px;
}

.account-name {
  color: #4361ee;
  font-weight: 600;
}

.date-filters {
  display: flex;
  gap: 20px;
  align-items: center;
}

.date-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-label {
  font-weight: 500;
  color: #555;
}

.grand-total {
  background-color: #4361ee !important;
  font-size: 1.1rem;
}

.grand-total .total-label {
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.final-balance {
  font-size: 1.2rem;
  text-align: right !important;
  padding: 15px !important;
}

.final-balance.positive {
  background-color: rgba(46, 204, 113, 0.15);
  color: #2ecc71 !important;
}

.final-balance.negative {
  background-color: rgba(231, 76, 60, 0.15);
  color: #e74c3c !important;
}

.final-balance strong {
  font-weight: 700;
}
.date-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 40px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #4361ee;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 50px 20px;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 15px;
}

.table-container {
  overflow-x: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.transaction-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.transaction-table th {
  background-color: #4361ee;
  color: white;
  font-weight: 500;
  padding: 12px 15px;
  text-align: left;
}

.transaction-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}

.transaction-row:hover {
  background-color: #f8f9fa;
}

.even-row {
  background-color: #f9f9f9;
}

.date-col {
  width: 120px;
}

.ref-col {
  min-width: 150px;
}

.amount-col {
  width: 150px;
  text-align: right !important;
}

.positive {
  color: #2ecc71;
  font-weight: 500;
}

.negative {
  color: #e74c3c;
  font-weight: 500;
}

.zero {
  color: #95a5a6;
}

.transaction-total {
  background-color: #f1f3f9 !important;
  font-weight: 500;
}

.total-label {
  font-weight: 600;
  color: #2c3e50;
}

.total-amount {
  text-align: right;
  font-weight: 500;
}

.grand-total {
  background-color: #2c3e50 !important;
  color: white;
}

.grand-total .total-label {
  color: white;
}

.grand-total .positive, 
.grand-total .negative {
  color: white;
  font-weight: 600;
}

@media (max-width: 768px) {
  .date-filters {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .account-title {
    font-size: 1.5rem;
  }
  
  .transaction-table th, 
  .transaction-table td {
    padding: 8px 10px;
    font-size: 0.85rem;
  }
}
</style>