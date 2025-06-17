/* Vue en cartes pour transactions - Design moderne */
<style>
.transactions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.transaction-card {
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border-radius: 24px;
  padding: 0;
  box-shadow: 
    0 10px 30px rgba(0,0,0,0.08),
    0 2px 8px rgba(0,0,0,0.04);
  border: 1px solid rgba(255,255,255,0.9);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.transaction-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
}

.transaction-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 20px 60px rgba(0,0,0,0.15),
    0 8px 30px rgba(102, 126, 234, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
}

.date-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.date-badge i {
  color: #667eea;
}

.main-amount {
  text-align: right;
}

.main-amount .amount-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  opacity: 0.7;
  margin-bottom: 0.25rem;
}

.main-amount .amount-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
}

.debit-main .amount-value { color: #e74c3c; }
.credit-main .amount-value { color: #27ae60; }
.neutral-main .amount-value { color: #6c757d; }

.card-body {
  padding: 0 1.5rem 1.5rem;
}

.account-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255,255,255,0.7);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.account-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.account-asset { background: linear-gradient(135deg, #3498db, #2980b9); }
.account-liability { background: linear-gradient(135deg, #e74c3c, #c0392b); }
.account-bank { background: linear-gradient(135deg, #f39c12, #d68910); }
.account-expense { background: linear-gradient(135deg, #9b59b6, #8e44ad); }
.account-revenue { background: linear-gradient(135deg, #27ae60, #229954); }
.account-default { background: linear-gradient(135deg, #95a5a6, #7f8c8d); }

.account-details .account-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.account-details .account-code {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
}

.amounts-section {
  margin-bottom: 1.5rem;
}

.amount-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.amount-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.amount-item.debit {
  border-left: 4px solid #e74c3c;
}

.amount-item.credit {
  border-left: 4px solid #27ae60;
}

.amount-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: white;
}

.amount-item.debit .amount-icon {
  background: #e74c3c;
}

.amount-item.credit .amount-icon {
  background: #27ae60;
}

.amount-info .amount-label {
  display: block;
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 500;
}

.amount-info .amount-value {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.reference-section {
  margin-bottom: 1rem;
}

.reference-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.description-section {
  margin-top: 1rem;
}

.description-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #667eea;
  font-size: 0.9rem;
  color: #495057;
  line-height: 1.5;
}

.card-footer {
  padding: 1rem 1.5rem;
  background: rgba(248, 249, 250, 0.8);
  border-top: 1px solid rgba(0,0,0,0.05);
}

.balance-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-indicator .balance-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #6c757d;
}

.balance-indicator .balance-value {
  font-size: 1.2rem;
  font-weight: 700;
}

.balance-indicator.positive .balance-value { color: #27ae60; }
.balance-indicator.negative .balance-value { color: #e74c3c; }
.balance-indicator.neutral .balance-value { color: #6c757d; }

/* Tableau moderne */
.modern-table-container {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.9);
}

.table-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.table-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  opacity: 0.9;
}

.modern-transactions-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.modern-transactions-table thead th {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  color: #495057;
  padding: 1.5rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 2px solid #dee2e6;
  position: sticky;
  top: 0;
  z-index: 10;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-start;
}

.modern-transactions-table th.sortable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.modern-transactions-table th.sortable:hover {
  background: linear-gradient(135deg, #e9ecef, #dee2e6);
}

.sort-icon {
  opacity: 0.5;
  font-size: 0.8rem;
  margin-left: auto;
}

.modern-transactions-table tbody tr {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f3f4;
}

.modern-transactions-table tbody tr:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02), rgba(118, 75, 162, 0.02));
  transform: scale(1.001);
}

.row-even {
  background: rgba(248, 249, 250, 0.3);
}

.modern-transactions-table td {
  padding: 1.25rem 1rem;
  vertical-align: middle;
}

.date-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-main {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.date-time {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.account-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.account-icon-small {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: white;
}

.account-info {
  flex: 1;
}

.account-name-table {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.account-code-table {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.amount-container {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
  font-size: 1rem;
}

.amount-container.debit {
  color: #e74c3c;
}

.amount-container.credit {
  color: #27ae60;
}

.amount-symbol {
  font-size: 0.9rem;
  opacity: 0.8;
}

.amount-number {
  font-weight: 700;
}

.amount-empty {
  color: #bdc3c7;
  font-size: 1.2rem;
  text-align: center;
}

.impact-container {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 700;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-align: center;
}

.impact-container.positive {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
}

.impact-container.negative {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.impact-container.neutral {
  background: rgba(108, 117, 125, 0.1);
  color: #6c757d;
}

.impact-symbol {
  font-size: 0.9rem;
  opacity: 0.8;
}

.ref-container {
  text-align: center;
}

.ref-chip {
  display: inline-block;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

/* Colonnes du tableau */
.date-col { width: 120px; }
.account-col { width: 300px; }
.amount-col { width: 130px; text-align: center; }
.ref-col { width: 150px; text-align: center; }

/* Responsive pour les cartes */
@media (max-width: 1200px) {
  .transactions-grid {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .transactions-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.5rem;
  }
  
  .transaction-card {
    border-radius: 16px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    text-align: center;
  }
  
  .amount-grid {
    grid-template-columns: 1fr;
  }
  
  .account-section {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .modern-table-container {
    border-radius: 16px;
    margin: 0 -1rem;
  }
  
  .table-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .modern-transactions-table {
    font-size: 0.85rem;
  }
  
  .modern-transactions-table th,
  .modern-transactions-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .account-container {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .th-content {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .card-header {
    padding: 1rem;
  }
  
  .card-body {
    padding: 0 1rem 1rem;
  }
  
  .date-badge {
    font-size: 0.8rem;
    padding: 0.5rem 0.75rem;
  }
  
  .main-amount .amount-value {
    font-size: 1.2rem;
  }
  
  .account-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  /* Masquer certaines colonnes sur très petit écran */
  .ref-col,
  .ref-cell {
    display: none;
  }
  
  .amount-col:last-child {
    display: table-cell;
  }
}

/* Animation d'entrée pour les cartes */
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

.transaction-card {
  animation: fadeInUp 0.6s ease-out;
}

.transaction-card:nth-child(1) { animation-delay: 0.1s; }
.transaction-card:nth-child(2) { animation-delay: 0.2s; }
.transaction-card:nth-child(3) { animation-delay: 0.3s; }
.transaction-card:nth-child(4) { animation-delay: 0.4s; }
.transaction-card:nth-child(5) { animation-delay: 0.5s; }
.transaction-card:nth-child(6) { animation-delay: 0.6s; }

/* Animation pour les lignes du tableau */
.transaction-row {
  animation: fadeInUp 0.4s ease-out;
}

.transaction-row:nth-child(1) { animation-delay: 0.05s; }
.transaction-row:nth-child(2) { animation-delay: 0.1s; }
.transaction-row:nth-child(3) { animation-delay: 0.15s; }
.transaction-row:nth-child(4) { animation-delay: 0.2s; }
.transaction-row:nth-child(5) { animation-delay: 0.25s; }

/* Effets de hover améliorés */
.reference-chip:hover,
.ref-chip:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.amount-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

/* Classes utilitaires pour les couleurs */
.text-success { color: #27ae60 !important; }
.text-danger { color: #e74c3c !important; }
.text-warning { color: #f39c12 !important; }
.text-info { color: #3498db !important; }
.text-muted { color: #7f8c8d !important; }/* Vue en cartes pour transactions */
.transactions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.transaction-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.8);
  transition: all 0.3s ease;
}

.transaction-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0,0,0,0.12);
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f3f4;
}

.transaction-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #495057;
}

.transaction-ref {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
}

.transaction-account {
  margin-bottom: 1.5rem;
}

.transaction-account .account-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.transaction-account .account-code {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.transaction-amounts {
  margin-bottom: 1rem;
}

.transaction-description {
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

/* Tableau des transactions */
.transactions-table {
  width: 100%;
  border-collapse: collapse;
}

.transactions-table thead {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.transactions-table th {
  padding: 1.25rem 1.5rem;
  text-align: left;
  font-weight: 600;
  color: white;
  font-size: 0.9rem;
  letter-spacing: 0.025em;
  border: none;
}

.transactions-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.transactions-table th.sortable:hover {
  background: rgba(255,255,255,0.1);
}

.transactions-table tbody tr {
  border-bottom: 1px solid #f1f3f4;
  transition: background-color 0.2s ease;
}

.transaction-row:hover {
  background: rgba(102, 126, 234, 0.02);
}

.transactions-table td {
  padding: 1rem 1.5rem;
  vertical-align: middle;
  border: none;
}

.account-cell {
  width: 250px;
}

.account-display {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.account-display .account-name {
  font-weight: 600;
  color: #333;
}

.account-display .account-code {
  font-size: 0.85rem;
  color: #666;
}
</style>
<template>
  <div class="all-accounts-app">
    <!-- En-tête principal -->
    <div class="main-header">
      <div class="header-content">
        <div class="title-section">
          <div class="icon-wrapper">
            <i class="fas fa-books"></i>
          </div>
          <div class="title-info">
            <h1 class="main-title">Toutes les Transactions</h1>
            <p class="subtitle">{{ getSubtitleText() }}</p>
          </div>
        </div>
        
        <!-- Filtres avancés -->
        <div class="filters-section">
          <div class="filters-container">
            <!-- Filtres de date -->
            <div class="filter-group date-filters">
              <label class="filter-label">
                <i class="fas fa-calendar-alt"></i>
                Période
              </label>
              <div class="date-inputs">
                <div class="date-input-wrapper">
                  <input 
                    type="date" 
                    v-model="dateDebut" 
                    class="filter-input date-input"
                    placeholder="Date de début"
                    @change="applyFilters"
                  >
                  <span class="input-helper">Début</span>
                </div>
                <div class="date-separator">
                  <i class="fas fa-arrow-right"></i>
                </div>
                <div class="date-input-wrapper">
                  <input 
                    type="date" 
                    v-model="dateFin" 
                    class="filter-input date-input"
                    placeholder="Date de fin"
                    @change="applyFilters"
                  >
                  <span class="input-helper">Fin</span>
                </div>
              </div>
            </div>

            <!-- Filtre de référence -->
            <div class="filter-group reference-filter">
              <label class="filter-label">
                <i class="fas fa-hashtag"></i>
                Référence
              </label>
              <div class="search-input-wrapper">
                <input 
                  type="text" 
                  v-model="referenceFilter" 
                  class="filter-input search-input"
                  placeholder="REF01, Journal..."
                  @input="applyFilters"
                >
                <i class="fas fa-search search-icon"></i>
                <button 
                  v-if="referenceFilter" 
                  @click="clearReference" 
                  class="clear-btn"
                  title="Effacer"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Filtre de montant -->
            <div class="filter-group amount-filter">
              <label class="filter-label">
                <i class="fas fa-euro-sign"></i>
                Montant
              </label>
              <div class="amount-inputs">
                <div class="amount-input-wrapper">
                  <input 
                    type="number" 
                    v-model.number="montantMin" 
                    class="filter-input amount-input"
                    placeholder="Min"
                    step="0.01"
                    @input="applyFilters"
                  >
                  <span class="currency-symbol">€</span>
                </div>
                <div class="amount-separator">-</div>
                <div class="amount-input-wrapper">
                  <input 
                    type="number" 
                    v-model.number="montantMax" 
                    class="filter-input amount-input"
                    placeholder="Max"
                    step="0.01"
                    @input="applyFilters"
                  >
                  <span class="currency-symbol">€</span>
                </div>
              </div>
            </div>

            <!-- Actions de filtrage -->
            <div class="filter-actions">
              <button @click="resetFilters" class="reset-btn" title="Réinitialiser les filtres">
                <i class="fas fa-undo"></i>
                <span>Reset</span>
              </button>
              <div class="filter-summary" v-if="hasActiveFilters">
                <span class="active-filters-count">
                  {{ activeFiltersCount }} filtre{{ activeFiltersCount > 1 ? 's' : '' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Résumé global -->
    <div class="global-summary" v-if="!loading && accounts.length > 0">
      <div class="summary-card">
        <div class="summary-icon global">
          <i class="fas fa-chart-pie"></i>
        </div>
        <div class="summary-content">
          <h3 class="summary-value">{{ formatCurrency(globalTotals.debits) }}</h3>
          <p class="summary-label">Total Débits Global</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon global">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="summary-content">
          <h3 class="summary-value">{{ formatCurrency(globalTotals.credits) }}</h3>
          <p class="summary-label">Total Crédits Global</p>
        </div>
      </div>
      
      <div class="summary-card balance" :class="getGlobalBalanceClass()">
        <div class="summary-icon">
          <i class="fas fa-balance-scale"></i>
        </div>
        <div class="summary-content">
          <h3 class="summary-value">{{ formatCurrency(globalTotals.balance) }}</h3>
          <p class="summary-label">Solde Net Global</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon accounts">
          <i class="fas fa-list"></i>
        </div>
        <div class="summary-content">
          <h3 class="summary-value">
            {{ accounts.length }}
            <span v-if="hasActiveFilters" class="filtered-indicator">
              / {{ allTransactions?.length || 0 }}
            </span>
          </h3>
          <p class="summary-label">
            Transactions
            <span v-if="hasActiveFilters" class="filter-badge">filtrées</span>
          </p>
        </div>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="loading-state">
      <div class="loading-animation">
        <div class="loading-spinner"></div>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <p class="loading-text">Chargement des comptes...</p>
    </div>

    <!-- État vide -->
    <div v-if="!loading && accounts.length === 0" class="empty-state">
      <div class="empty-illustration">
        <i class="fas fa-folder-open"></i>
      </div>
      <h3 class="empty-title">Aucun compte trouvé</h3>
      <p class="empty-description">Il n'y a pas de comptes disponibles pour la période sélectionnée.</p>
    </div>

    <!-- Liste des comptes -->
    <div class="accounts-section" v-if="!loading && accounts.length > 0">
      <div class="section-header">
        <h2 class="section-title">
          <i class="fas fa-list"></i>
          Liste des Transactions
        </h2>
        <div class="view-options">
          <button 
            class="view-btn" 
            :class="{ active: viewMode === 'cards' }"
            @click="viewMode = 'cards'"
          >
            <i class="fas fa-th-large"></i>
            Cartes
          </button>
          <button 
            class="view-btn" 
            :class="{ active: viewMode === 'table' }"
            @click="viewMode = 'table'"
          >
            <i class="fas fa-table"></i>
            Liste
          </button>
        </div>
      </div>

      <!-- Vue en cartes -->
      <div v-if="viewMode === 'cards'" class="transactions-grid">
        <div 
          v-for="transaction in accounts" 
          :key="transaction.id"
          class="transaction-card"
        >
          <!-- En-tête avec date et montant principal -->
          <div class="card-header">
            <div class="date-badge">
              <i class="fas fa-calendar-day"></i>
              <span>{{ formatDate(transaction.date) }}</span>
            </div>
            <div class="main-amount" :class="getTransactionTypeClass(transaction)">
              <span class="amount-label">{{ getMainAmountLabel(transaction) }}</span>
              <span class="amount-value">{{ formatCurrency(getMainAmount(transaction)) }}</span>
            </div>
          </div>

          <!-- Corps de la carte -->
          <div class="card-body">
            <!-- Compte -->
            <div class="account-section">
              <div class="account-icon" :class="getAccountTypeClass(transaction.accountCode)">
                <i :class="getAccountIcon(transaction.accountCode)"></i>
              </div>
              <div class="account-details">
                <div class="account-name">{{ transaction.accountName }}</div>
                <div class="account-code">{{ transaction.accountCode }}</div>
              </div>
            </div>

            <!-- Détails des montants -->
            <div class="amounts-section">
              <div class="amount-grid">
                <div class="amount-item debit">
                  <div class="amount-icon">
                    <i class="fas fa-arrow-up"></i>
                  </div>
                  <div class="amount-info">
                    <span class="amount-label">Débit</span>
                    <span class="amount-value">{{ formatCurrency(transaction.debit) }}</span>
                  </div>
                </div>
                <div class="amount-item credit">
                  <div class="amount-icon">
                    <i class="fas fa-arrow-down"></i>
                  </div>
                  <div class="amount-info">
                    <span class="amount-label">Crédit</span>
                    <span class="amount-value">{{ formatCurrency(transaction.credit) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Référence du journal -->
            <div class="reference-section">
              <div class="reference-chip">
                <i class="fas fa-hashtag"></i>
                <span>{{ transaction.journalRef }}</span>
              </div>
            </div>

            <!-- Description si présente -->
            <div class="description-section" v-if="transaction.description">
              <div class="description-content">
                <i class="fas fa-comment-alt"></i>
                <span>{{ transaction.description }}</span>
              </div>
            </div>
          </div>

          <!-- Pied de carte avec solde -->
          <div class="card-footer">
            <div class="balance-indicator" :class="getBalanceClass(transaction.debit - transaction.credit)">
              <span class="balance-label">Impact</span>
              <span class="balance-value">{{ formatCurrency(transaction.debit - transaction.credit) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue en tableau moderne -->
      <div v-if="viewMode === 'table'" class="modern-table-container">
        <div class="table-card">
          <div class="table-header">
            <h3 class="table-title">
              <i class="fas fa-list-ul"></i>
              Historique des Transactions
            </h3>
            <div class="table-stats">
              <span class="stat-item">
                <i class="fas fa-calculator"></i>
                {{ accounts.length }} transactions
              </span>
            </div>
          </div>

          <div class="table-wrapper">
            <table class="modern-transactions-table">
              <thead>
                <tr>
                  <th class="sortable date-col" @click="sortBy('date')">
                    <div class="th-content">
                      <i class="fas fa-calendar"></i>
                      <span>Date</span>
                      <i :class="getSortIcon('date')" class="sort-icon"></i>
                    </div>
                  </th>
                  <th class="sortable account-col" @click="sortBy('accountName')">
                    <div class="th-content">
                      <i class="fas fa-building"></i>
                      <span>Compte</span>
                      <i :class="getSortIcon('accountName')" class="sort-icon"></i>
                    </div>
                  </th>
                  <th class="amount-col">
                    <div class="th-content">
                      <i class="fas fa-arrow-up text-success"></i>
                      <span>Débit</span>
                    </div>
                  </th>
                  <th class="amount-col">
                    <div class="th-content">
                      <i class="fas fa-arrow-down text-danger"></i>
                      <span>Crédit</span>
                    </div>
                  </th>
                  <th class="amount-col">
                    <div class="th-content">
                      <i class="fas fa-balance-scale"></i>
                      <span>Impact</span>
                    </div>
                  </th>
                  <th class="ref-col">
                    <div class="th-content">
                      <i class="fas fa-hashtag"></i>
                      <span>Référence</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(transaction, index) in sortedTransactions" 
                  :key="transaction.id"
                  class="transaction-row"
                  :class="{ 'row-even': index % 2 === 0 }"
                >
                  <td class="date-cell">
                    <div class="date-container">
                      <div class="date-main">{{ formatDateShort(transaction.date) }}</div>
                      <div class="date-time">{{ formatTime(transaction.date) }}</div>
                    </div>
                  </td>
                  <td class="account-cell">
                    <div class="account-container">
                      <div class="account-icon-small" :class="getAccountTypeClass(transaction.accountCode)">
                        <i :class="getAccountIcon(transaction.accountCode)"></i>
                      </div>
                      <div class="account-info">
                        <div class="account-name-table">{{ transaction.accountName }}</div>
                        <div class="account-code-table">{{ transaction.accountCode }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="amount-cell">
                    <div class="amount-container debit" v-if="transaction.debit > 0">
                      <span class="amount-symbol">+</span>
                      <span class="amount-number">{{ formatCurrencyShort(transaction.debit) }}</span>
                    </div>
                    <div class="amount-empty" v-else>—</div>
                  </td>
                  <td class="amount-cell">
                    <div class="amount-container credit" v-if="transaction.credit > 0">
                      <span class="amount-symbol">-</span>
                      <span class="amount-number">{{ formatCurrencyShort(transaction.credit) }}</span>
                    </div>
                    <div class="amount-empty" v-else>—</div>
                  </td>
                  <td class="amount-cell">
                    <div class="impact-container" :class="getBalanceClass(transaction.debit - transaction.credit)">
                      <span class="impact-symbol">{{ (transaction.debit - transaction.credit) >= 0 ? '+' : '' }}</span>
                      <span class="impact-amount">{{ formatCurrencyShort(transaction.debit - transaction.credit) }}</span>
                    </div>
                  </td>
                  <td class="ref-cell">
                    <div class="ref-container">
                      <span class="ref-chip">{{ transaction.journalRef }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions globales -->
    <div class="global-actions" v-if="!loading && accounts.length > 0">
      <button class="global-export-btn" @click="exportAllToPDF" :disabled="isExporting">
        <i class="fas fa-file-pdf"></i>
        <span v-if="!isExporting">Exporter tout en PDF</span>
        <span v-else>Export en cours...</span>
      </button>
      <button class="global-export-btn" @click="exportAllToExcel" :disabled="isExporting">
        <i class="fas fa-file-excel"></i>
        <span v-if="!isExporting">Exporter tout en Excel</span>
        <span v-else>Export en cours...</span>
      </button>
    </div>

    <!-- Notification -->
    <div v-if="notification" class="notification" :class="notification.type">
      <i :class="notification.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import * as fonction from '../js/fonction.js';
import * as XLSX from 'xlsx';

export default {
  data() {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    
    return {
      dateDebut: firstDayOfMonth,
      dateFin: today,
      referenceFilter: '',
      montantMin: null,
      montantMax: null,
      allTransactions: [], // Stockage de toutes les transactions non filtrées
      accounts: [],
      loading: true,
      viewMode: 'cards', // 'cards' ou 'table'
      sortField: '',
      sortDirection: 'asc',
      isExporting: false,
      notification: null
    };
  },
  mounted() {
    this.fetchAllAccounts();
  },
  computed: {
    globalTotals() {
      return this.accounts.reduce((totals, transaction) => {
        totals.debits += transaction.debit || 0;
        totals.credits += transaction.credit || 0;
        totals.balance += (transaction.debit || 0) - (transaction.credit || 0);
        return totals;
      }, { debits: 0, credits: 0, balance: 0 });
    },
    sortedTransactions() {
      if (!this.sortField) return this.accounts;
      
      return [...this.accounts].sort((a, b) => {
        let valueA = a[this.sortField] || '';
        let valueB = b[this.sortField] || '';
        
        if (typeof valueA === 'string') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }
        
        if (this.sortDirection === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    },
    hasActiveFilters() {
      return this.dateDebut || this.dateFin || this.referenceFilter || 
             this.montantMin !== null || this.montantMax !== null;
    },
    activeFiltersCount() {
      let count = 0;
      if (this.dateDebut || this.dateFin) count++;
      if (this.referenceFilter) count++;
      if (this.montantMin !== null || this.montantMax !== null) count++;
      return count;
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
    getBalanceClass(balance) {
      if (balance < 0) return 'negative';
      if (balance > 0) return 'positive';
      return 'neutral';
    },
    getGlobalBalanceClass() {
      const balance = this.globalTotals.balance;
      if (balance < 0) return 'negative-balance';
      if (balance > 0) return 'positive-balance';
      return 'neutral-balance';
    },
    getAccountStatusClass(account) {
      // Logique pour déterminer le statut du compte
      const balance = account.balance || 0;
      if (balance > 0) return 'positive';
      if (balance < 0) return 'negative';
      return 'neutral';
    },
    getSortIcon(field) {
      if (this.sortField !== field) return 'fas fa-sort';
      return this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    },
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
    },
    goToAccountDetail(account) {
      // Chercher l'ID dans différents champs possibles
      const possibleIdFields = ['C_ElementValue_ID', 'c_elementvalue_id', 'ID', 'id', 'ElementValue_ID', 'elementvalue_id'];
      let accountId = null;
      
      for (const field of possibleIdFields) {
        if (account[field] && account[field] !== 'undefined') {
          accountId = account[field];
          break;
        }
      }
      
      // Vérifier que le compte a un ID valide
      if (!accountId) {
        console.error('❌ Compte sans ID valide:', account);
        this.showNotification('Impossible d\'accéder aux détails de ce compte (ID invalide)', 'error');
        return;
      }
      
      // Stocker les informations du compte sélectionné
      sessionStorage.setItem('compte', accountId);
      sessionStorage.setItem('Nomcompte', account.Name || 'Compte sans nom');
      
      console.log(`🔗 Navigation vers le livre de compte: ${account.Name} (ID: ${accountId})`);
      
      // Naviguer vers la page de détail du livre de compte
      try {
        this.$router.push('/livreCompte');
      } catch (error) {
        console.error('Erreur lors de la navigation:', error);
        this.showNotification('Erreur lors de la navigation', 'error');
      }
    },
    showNotification(message, type = 'success') {
      this.notification = { message, type };
      setTimeout(() => {
        this.notification = null;
      }, 4000);
    },
    async fetchAllAccounts() {
      try {
        this.loading = true;
        const token = sessionStorage.getItem('authToken');
        
        console.log('🔄 Récupération de toutes les transactions...');
        
        // Récupérer tous les journaux (gl_journal) sans filtre
        const journalsData = await fonction.getIDempiereModels(token, 'gl_journal');
        const allJournals = journalsData.records || [];
        console.log(`📊 Total journaux trouvés: ${allJournals.length}`);
        
        // Récupérer toutes les lignes de journal (gl_journalline) sans filtre
        const journalLinesData = await fonction.getIDempiereModels(token, 'gl_journalline');
        const allJournalLines = journalLinesData.records || [];
        console.log(`📊 Total lignes de journal trouvées: ${allJournalLines.length}`);
        
        // Récupérer tous les comptes pour avoir les noms
        const accountsResponse = await fonction.getIDempiereModels(token, 'c_elementvalue');
        const allAccounts = accountsResponse.records || [];
        console.log(`📋 Total comptes trouvés: ${allAccounts.length}`);
        
        // Créer un mapping ID -> Nom de compte
        const accountMap = {};
        allAccounts.forEach(account => {
          const possibleIdFields = ['C_ElementValue_ID', 'c_elementvalue_id', 'ID', 'id', 'ElementValue_ID', 'elementvalue_id'];
          let accountId = null;
          
          for (const field of possibleIdFields) {
            if (account[field]) {
              accountId = account[field].toString();
              break;
            }
          }
          
          if (accountId) {
            accountMap[accountId] = {
              name: account.Name || account.name || `Compte ${accountId}`,
              code: account.Value || account.value || '',
              fullData: account
            };
          }
        });
        
        // Créer un mapping Journal ID -> Journal Info
        const journalMap = {};
        allJournals.forEach(journal => {
          const journalId = journal.GL_Journal_ID || journal.gl_journal_id || journal.ID || journal.id;
          if (journalId) {
            journalMap[journalId.toString()] = journal;
          }
        });
        
        // Traiter toutes les transactions (lignes de journal)
        const allTransactions = [];
        
        allJournalLines.forEach(line => {
          // Fonction pour extraire l'ID d'un objet ou d'une valeur simple
          const extractId = (value) => {
            if (!value) return null;
            if (typeof value === 'string' || typeof value === 'number') {
              return value.toString();
            }
            if (typeof value === 'object') {
              const extractedValue = value.id || value.ID || value.value || value.Value || 
                     value.c_elementvalue_id || value.C_ElementValue_ID ||
                     value.account_id || value.Account_ID || 
                     Object.values(value)[0];
              return extractedValue ? extractedValue.toString() : null;
            }
            return null;
          };
          
          // Extraire les IDs
          let accountId = null;
          const possibleAccountFields = ['Account_ID', 'account_id', 'C_ElementValue_ID', 'c_elementvalue_id'];
          
          for (const field of possibleAccountFields) {
            if (line[field]) {
              accountId = extractId(line[field]);
              if (accountId) break;
            }
          }
          
          const journalId = extractId(line.GL_Journal_ID || line.gl_journal_id);
          
          // Récupérer la date de la ligne
          const lineDate = line.DateAcct || line.dateacct;
          
          if (accountId && lineDate) {
            // Récupérer les infos du compte et du journal
            const accountInfo = accountMap[accountId];
            const journalInfo = journalMap[journalId] || {};
            
            // Créer l'objet transaction
            const transaction = {
              id: line.id || line.ID,
              date: lineDate,
              accountId: accountId,
              accountName: accountInfo ? accountInfo.name : `Compte ${accountId}`,
              accountCode: accountInfo ? accountInfo.code : '',
              journalId: journalId,
              journalRef: journalInfo.DocumentNo || `Journal ${journalId}`,
              debit: parseFloat(line.AmtSourceDr || line.amtsourcedr || 0),
              credit: parseFloat(line.AmtSourceCr || line.amtsourcecr || 0),
              description: line.Description || line.description || '',
              lineData: line,
              journalData: journalInfo,
              accountData: accountInfo
            };
            
            allTransactions.push(transaction);
          }
        });
        
        // Trier les transactions par date (plus récentes en premier)
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Stocker toutes les transactions non filtrées
        this.allTransactions = allTransactions;
        
        // Appliquer les filtres pour l'affichage initial
        this.applyFilters();
        
        console.log(`✅ Transactions récupérées: ${allTransactions.length}`);
        console.log('📋 Aperçu des transactions:', allTransactions.slice(0, 5).map(t => ({
          date: t.date,
          compte: t.accountName,
          débit: t.debit,
          crédit: t.credit,
          référence: t.journalRef
        })));
        
      } catch (error) {
        console.error("❌ Erreur lors du chargement des transactions:", error);
        this.showNotification('Erreur lors du chargement des transactions: ' + error.message, 'error');
      } finally {
        this.loading = false;
      }
    },
    filterTransactionsByDate(transactions) {
      if (!this.dateDebut && !this.dateFin) return transactions;
      
      const debut = this.dateDebut || "1900-01-01";
      const fin = this.dateFin || "2099-12-31";
      
      try {
        return transactions.filter(transaction => {
          if (!transaction || !transaction.lineDetail || !transaction.lineDetail.DateAcct) {
            return false;
          }
          
          const lineDate = transaction.lineDetail.DateAcct;
          return lineDate >= debut && lineDate <= fin;
        });
      } catch (error) {
        console.error('Erreur lors du filtrage par date:', error);
        return transactions;
      }
    },
    calculateAccountTotalsDirect(transactions) {
      let totalDebits = 0;
      let totalCredits = 0;
      let transactionCount = 0;
      
      try {
        transactions.forEach(line => {
          if (line) {
            transactionCount++;
            const debit = parseFloat(line.AmtSourceDr || line.amtsourcedr || 0);
            const credit = parseFloat(line.AmtSourceCr || line.amtsourcecr || 0);
            
            totalDebits += debit;
            totalCredits += credit;
          }
        });
      } catch (error) {
        console.error('Erreur lors du calcul des totaux:', error);
      }
      
      return {
        totalDebits: Math.round(totalDebits * 100) / 100,
        totalCredits: Math.round(totalCredits * 100) / 100,
        balance: Math.round((totalDebits - totalCredits) * 100) / 100,
        transactionCount
      };
    },
    
    getTransactionTypeClass(transaction) {
      if (transaction.debit > transaction.credit) return 'debit-main';
      if (transaction.credit > transaction.debit) return 'credit-main';
      return 'neutral-main';
    },
    
    getMainAmount(transaction) {
      return Math.max(transaction.debit, transaction.credit);
    },
    
    getMainAmountLabel(transaction) {
      if (transaction.debit > transaction.credit) return 'Débit';
      if (transaction.credit > transaction.debit) return 'Crédit';
      return 'Égal';
    },
    
    getAccountTypeClass(accountCode) {
      if (!accountCode) return 'account-default';
      const code = accountCode.toString();
      if (code.startsWith('1') || code.startsWith('2') || code.startsWith('3')) return 'account-asset';
      if (code.startsWith('4')) return 'account-liability';
      if (code.startsWith('5')) return 'account-bank';
      if (code.startsWith('6')) return 'account-expense';
      if (code.startsWith('7')) return 'account-revenue';
      return 'account-default';
    },
    
    getAccountIcon(accountCode) {
      if (!accountCode) return 'fas fa-circle';
      const code = accountCode.toString();
      if (code.startsWith('1') || code.startsWith('2') || code.startsWith('3')) return 'fas fa-building';
      if (code.startsWith('4')) return 'fas fa-handshake';
      if (code.startsWith('5')) return 'fas fa-university';
      if (code.startsWith('6')) return 'fas fa-shopping-cart';
      if (code.startsWith('7')) return 'fas fa-chart-line';
      return 'fas fa-circle';
    },
    
    formatDateShort(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit'
      });
    },
    
    formatTime(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric'
      });
    },
    
    formatCurrencyShort(amount) {
      if (amount === null || amount === undefined || amount === 0) return '0';
      
      const absAmount = Math.abs(amount);
      if (absAmount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M €`;
      }
      if (absAmount >= 1000) {
        return `${(amount / 1000).toFixed(1)}K €`;
      }
      return `${amount.toFixed(0)} €`;
    },
    
    applyFilters() {
      let filteredTransactions = [...this.allTransactions];
      
      // Filtre par date
      if (this.dateDebut || this.dateFin) {
        const debut = this.dateDebut ? new Date(this.dateDebut) : new Date('1900-01-01');
        const fin = this.dateFin ? new Date(this.dateFin) : new Date('2099-12-31');
        
        filteredTransactions = filteredTransactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate >= debut && transactionDate <= fin;
        });
      }
      
      // Filtre par référence
      if (this.referenceFilter) {
        const searchTerm = this.referenceFilter.toLowerCase().trim();
        filteredTransactions = filteredTransactions.filter(transaction => {
          return transaction.journalRef.toLowerCase().includes(searchTerm) ||
                 transaction.accountName.toLowerCase().includes(searchTerm) ||
                 transaction.accountCode.toLowerCase().includes(searchTerm) ||
                 (transaction.description && transaction.description.toLowerCase().includes(searchTerm));
        });
      }
      
      // Filtre par montant
      if (this.montantMin !== null || this.montantMax !== null) {
        filteredTransactions = filteredTransactions.filter(transaction => {
          const maxAmount = Math.max(transaction.debit, transaction.credit);
          const minOk = this.montantMin === null || maxAmount >= this.montantMin;
          const maxOk = this.montantMax === null || maxAmount <= this.montantMax;
          return minOk && maxOk;
        });
      }
      
      this.accounts = filteredTransactions;
      
      console.log(`🔍 Filtres appliqués: ${this.allTransactions.length} → ${filteredTransactions.length} transactions`);
    },
    
    resetFilters() {
      this.dateDebut = '';
      this.dateFin = '';
      this.referenceFilter = '';
      this.montantMin = null;
      this.montantMax = null;
      this.applyFilters();
      this.showNotification('Filtres réinitialisés', 'success');
    },
    
    clearReference() {
      this.referenceFilter = '';
      this.applyFilters();
    },
    
    refreshAllData() {
      // Méthode pour rafraîchir toutes les données si nécessaire
      this.fetchAllAccounts();
    },
    
    getSubtitleText() {
      if (this.hasActiveFilters) {
        return `${this.accounts.length} transaction${this.accounts.length > 1 ? 's' : ''} trouvée${this.accounts.length > 1 ? 's' : ''}`;
      }
      return `${this.allTransactions?.length || 0} transaction${(this.allTransactions?.length || 0) > 1 ? 's' : ''} au total`;
    },
    async refreshAllData() {
      await this.fetchAllAccounts();
    },
    async exportAllToPDF() {
      try {
        this.isExporting = true;
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          throw new Error('Popup bloqué - Veuillez autoriser les popups pour ce site');
        }
        
        const htmlContent = this.generateAllAccountsPrintHTML();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
        };
        
        this.showNotification('Export PDF de tous les comptes initié !', 'success');
        
      } catch (error) {
        console.error('Erreur lors de l\'export PDF:', error);
        this.showNotification('Erreur lors de l\'export PDF: ' + error.message, 'error');
      } finally {
        this.isExporting = false;
      }
    },
    generateAllAccountsPrintHTML() {
      let accountsHTML = '';
      
      this.accounts.forEach(account => {
        accountsHTML += `
          <div class="account-section">
            <h3>${account.Name} (${account.Value})</h3>
            <div class="account-summary">
              <div>Débits: ${this.formatCurrency(account.totalDebits)}</div>
              <div>Crédits: ${this.formatCurrency(account.totalCredits)}</div>
              <div>Solde: ${this.formatCurrency(account.balance)}</div>
              <div>Transactions: ${account.transactionCount}</div>
            </div>
          </div>
        `;
      });
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Tous les Livres de Compte</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background: #667eea; color: white; padding: 20px; margin-bottom: 20px; }
            .global-summary { background: #f8f9fa; padding: 15px; margin-bottom: 20px; }
            .account-section { margin-bottom: 30px; padding: 15px; border: 1px solid #ddd; }
            .account-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TOUS LES LIVRES DE COMPTE</h1>
            <p>Période: ${this.formatDate(this.dateDebut)} - ${this.formatDate(this.dateFin)}</p>
            <p>Généré le: ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          
          <div class="global-summary">
            <h3>RÉSUMÉ GLOBAL</h3>
            <div>Total Débits Global: ${this.formatCurrency(this.globalTotals.debits)}</div>
            <div>Total Crédits Global: ${this.formatCurrency(this.globalTotals.credits)}</div>
            <div>Solde Net Global: ${this.formatCurrency(this.globalTotals.balance)}</div>
            <div>Nombre de comptes: ${this.accounts.length}</div>
          </div>
          
          ${accountsHTML}
        </body>
        </html>
      `;
    },
    async exportAllToExcel() {
      try {
        this.isExporting = true;
        
        const worksheetData = [];
        
        // En-tête
        worksheetData.push(['TOUS LES LIVRES DE COMPTE']);
        worksheetData.push([`Période: ${this.formatDate(this.dateDebut)} - ${this.formatDate(this.dateFin)}`]);
        worksheetData.push([`Généré le: ${new Date().toLocaleDateString('fr-FR')}`]);
        worksheetData.push([]);
        
        // Résumé global
        worksheetData.push(['RÉSUMÉ GLOBAL']);
        worksheetData.push(['Total Débits Global:', this.globalTotals.debits]);
        worksheetData.push(['Total Crédits Global:', this.globalTotals.credits]);
        worksheetData.push(['Solde Net Global:', this.globalTotals.balance]);
        worksheetData.push(['Nombre de comptes:', this.accounts.length]);
        worksheetData.push([]);
        
        // En-têtes du tableau
        worksheetData.push(['Code', 'Nom du Compte', 'Débits (€)', 'Crédits (€)', 'Solde (€)', 'Transactions']);
        
        // Données des comptes
        this.accounts.forEach(account => {
          worksheetData.push([
            account.Value,
            account.Name,
            account.totalDebits || 0,
            account.totalCredits || 0,
            account.balance || 0,
            account.transactionCount || 0
          ]);
        });
        
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        
        worksheet['!cols'] = [
          { width: 12 }, // Code
          { width: 30 }, // Nom
          { width: 15 }, // Débits
          { width: 15 }, // Crédits
          { width: 15 }, // Solde
          { width: 12 }  // Transactions
        ];
        
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Tous les Comptes');
        
        const fileName = `tous_les_comptes_${this.dateDebut}_${this.dateFin}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        
        this.showNotification('Export Excel réussi !', 'success');
        
      } catch (error) {
        console.error('Erreur lors de l\'export Excel:', error);
        this.showNotification('Erreur lors de l\'export Excel', 'error');
      } finally {
        this.isExporting = false;
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

.all-accounts-app {
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

.subtitle {
  font-size: 1.1rem;
  font-weight: 400;
  margin: 0;
  opacity: 0.9;
}

/* Filtres identiques au composant original */
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

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modern-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
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

/* Résumé global */
.global-summary {
  max-width: 1400px;
  margin: -2rem auto 2rem;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  z-index: 10;
  position: relative;
}

.summary-card {
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

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0,0,0,0.12);
}

.summary-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.summary-icon.global {
  background: linear-gradient(135deg, #339af0, #228be6);
}

.summary-icon.accounts {
  background: linear-gradient(135deg, #9775fa, #845ef7);
}

.summary-content {
  flex: 1;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: #1a1a1a;
}

.summary-label {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  font-weight: 500;
}

.balance.positive-balance .summary-icon {
  background: linear-gradient(135deg, #51cf66, #40c057);
}

.balance.negative-balance .summary-icon {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
}

/* États de chargement et vide */
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

/* Section des comptes */
.accounts-section {
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

.view-options {
  display: flex;
  gap: 0.5rem;
  background: white;
  border-radius: 12px;
  padding: 0.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn.active {
  background: #667eea;
  color: white;
}

.view-btn:hover:not(.active) {
  background: #f8f9fa;
  color: #333;
}

/* Vue en cartes */
.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.account-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.8);
  transition: all 0.3s ease;
  cursor: pointer;
}

.account-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0,0,0,0.12);
}

.account-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.account-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.account-info {
  flex: 1;
}

.account-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #333;
}

.account-code {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  font-weight: 500;
}

.account-status {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.account-status.positive {
  color: #4caf50;
}

.account-status.negative {
  color: #f44336;
}

.account-status.neutral {
  color: #9e9e9e;
}

.account-metrics {
  margin-bottom: 1.5rem;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.metric-row:last-child {
  border-bottom: none;
}

.balance-row {
  font-weight: 600;
  background: #f8f9fa;
  margin: 0 -0.5rem;
  padding: 0.75rem 0.5rem;
  border-radius: 8px;
}

.metric-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.metric-value {
  font-size: 0.9rem;
  font-weight: 600;
}

.metric-value.debit {
  color: #d32f2f;
}

.metric-value.credit {
  color: #2e7d32;
}

.metric-value.positive {
  color: #2e7d32;
}

.metric-value.negative {
  color: #d32f2f;
}

.metric-value.neutral {
  color: #666;
}

.account-actions {
  display: flex;
  justify-content: center;
}

.detail-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.detail-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* Vue en tableau */
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

.accounts-table {
  width: 100%;
  border-collapse: collapse;
}

.accounts-table thead {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.accounts-table th {
  padding: 1.25rem 1.5rem;
  text-align: left;
  font-weight: 600;
  color: white;
  font-size: 0.9rem;
  letter-spacing: 0.025em;
  border: none;
}

.accounts-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.accounts-table th.sortable:hover {
  background: rgba(255,255,255,0.1);
}

.accounts-table th span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.amount-header,
.center-header {
  text-align: center;
}

.accounts-table tbody tr {
  border-bottom: 1px solid #f1f3f4;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.account-row:hover {
  background: rgba(102, 126, 234, 0.02);
}

.accounts-table td {
  padding: 1rem 1.5rem;
  vertical-align: middle;
  border: none;
}

.code-cell {
  width: 120px;
}

.code-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-block;
}

.name-cell {
  width: 300px;
}

.name-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.account-icon-small {
  color: #667eea;
  font-size: 0.9rem;
}

.amount-cell {
  text-align: right;
  width: 150px;
  font-weight: 500;
}

.amount-value.debit {
  color: #d32f2f;
}

.amount-value.credit {
  color: #2e7d32;
}

.amount-value.positive {
  color: #2e7d32;
}

.amount-value.negative {
  color: #d32f2f;
}

.amount-value.neutral {
  color: #666;
}

.center-cell {
  text-align: center;
  width: 120px;
}

.transaction-count {
  background: #f8f9fa;
  color: #495057;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.actions-cell {
  text-align: center;
  width: 80px;
}

.action-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.action-btn:hover {
  background: #5a67d8;
  transform: scale(1.1);
}

/* Actions globales */
.global-actions {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.global-export-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  justify-content: center;
}

.global-export-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.global-export-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Notification */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  border-left: 4px solid;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1000;
  animation: slideIn 0.3s ease;
  max-width: 350px;
}

.notification.success {
  border-left-color: #4caf50;
  color: #2e7d32;
}

.notification.error {
  border-left-color: #f44336;
  color: #d32f2f;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .global-summary {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    margin-top: 2rem;
  }

  .accounts-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .view-options {
    justify-content: center;
  }

  .accounts-grid {
    grid-template-columns: 1fr;
  }

  .global-actions {
    flex-direction: column;
    align-items: center;
  }

  .global-export-btn {
    width: 100%;
    max-width: 300px;
  }

  .accounts-table th,
  .accounts-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
  }

  .name-cell {
    width: auto;
    min-width: 200px;
  }

  .notification {
    left: 20px;
    right: 20px;
    max-width: none;
  }
}
</style>