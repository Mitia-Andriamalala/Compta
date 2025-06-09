<style scoped>
/* Variables CSS */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
  --border-radius: 8px;
  --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

/* Layout principal */
.factures-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* En-tête et tableau de bord */
.dashboard-header {
  margin-bottom: 2rem;
}

.page-title {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title h1 {
  color: var(--dark-color);
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.page-title i {
  color: var(--primary-color);
  margin-right: 0.75rem;
}

.subtitle {
  color: var(--secondary-color);
  margin: 0;
  font-size: 1.1rem;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--box-shadow);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: var(--transition);
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.metric-card.pending .metric-icon {
  background: linear-gradient(135deg, var(--warning-color), #e68900);
}

.metric-card.paid .metric-icon {
  background: linear-gradient(135deg, var(--success-color), #1e7e34);
}

.metric-card.overdue .metric-icon {
  background: linear-gradient(135deg, var(--danger-color), #bd2130);
}

.metric-card.partial .metric-icon {
  background: linear-gradient(135deg, var(--info-color), #117a8b);
}

.metric-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--dark-color);
}

.metric-content p {
  margin: 0;
  color: var(--secondary-color);
  font-size: 0.9rem;
}

/* Debug section */
.debug-section {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 4px;
}

.debug-section h4 {
  color: #856404;
  margin: 0 0 1rem 0;
}

/* Contrôles et filtres */
.controls-section {
  margin-bottom: 2rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary, .btn-export {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--secondary-color);
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-export {
  background: var(--success-color);
  color: white;
}

.btn-export:hover {
  background: #1e7e34;
}

.filters-section {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.filter-card {
  padding: 1.5rem;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--dark-color);
  font-size: 0.9rem;
}

.filter-group input,
.filter-group select {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: var(--transition);
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-filter, .btn-reset {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: var(--transition);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-filter {
  background: var(--primary-color);
  color: white;
}

.btn-filter:hover {
  background: #0056b3;
}

.btn-reset {
  background: var(--secondary-color);
  color: white;
}

.btn-reset:hover {
  background: #545b62;
}

/* Alertes */
.alertes-section {
  margin-bottom: 2rem;
}

.alert-card {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: var(--border-radius);
  padding: 1.5rem;
}

.alert-card h3 {
  color: #856404;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: var(--transition);
}

.alert-item:hover {
  background: #f8f9fa;
}

.alert-icon {
  color: var(--danger-color);
  font-size: 1.2rem;
}

.alert-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.alert-title {
  font-weight: 600;
  color: var(--dark-color);
}

.alert-details {
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.btn-show-all {
  background: transparent;
  border: 1px solid #856404;
  color: #856404;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: var(--transition);
}

.btn-show-all:hover {
  background: #856404;
  color: white;
}

/* Section tableau */
.table-section {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.table-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header h2 {
  margin: 0;
  color: var(--dark-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-controls select {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
}

.table-wrapper {
  overflow-x: auto;
}

.factures-table {
  width: 100%;
  border-collapse: collapse;
}

.factures-table th {
  background: var(--light-color);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--dark-color);
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
}

.factures-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: var(--transition);
}

.factures-table th.sortable:hover {
  background: #e9ecef;
}

.factures-table th span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.factures-table th.amount-col,
.factures-table td.amount-cell {
  text-align: right;
}

.factures-table td {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle;
}

.facture-row {
  transition: var(--transition);
}

.facture-row:hover {
  background: var(--light-color);
}

.facture-row.row-overdue {
  background: rgba(220, 53, 69, 0.05);
}

.facture-row.row-paid {
  background: rgba(40, 167, 69, 0.05);
}

.facture-row.row-partial {
  background: rgba(23, 162, 184, 0.05);
}

.document-number {
  font-weight: 600;
  color: var(--primary-color);
}

.type-customer {
  background: #d4edda;
  color: #155724;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.type-vendor {
  background: #d1ecf1;
  color: #0c5460;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.partner-info {
  display: flex;
  flex-direction: column;
}

.partner-name {
  font-weight: 500;
  color: var(--dark-color);
}

.partner-code {
  font-size: 0.8rem;
  color: var(--secondary-color);
}

.amount-value {
  font-weight: 600;
  color: var(--dark-color);
}

.amount-paid {
  color: var(--success-color);
  font-weight: 500;
}

.amount-remaining.amount-positive {
  color: var(--danger-color);
  font-weight: 600;
}

.amount-remaining.amount-zero {
  color: var(--success-color);
  font-weight: 500;
}

/* Statuts */
.status-en-attente {
  background: #fff3cd;
  color: #856404;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-partiel {
  background: #d1ecf1;
  color: #0c5460;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-regle {
  background: #d4edda;
  color: #155724;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-retard {
  background: #f8d7da;
  color: #721c24;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Actions */
.actions-cell {
  width: 180px;
}

.btn-action {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  font-size: 0.8rem;
  margin: 0 2px;
}

.btn-view {
  background: var(--info-color);
  color: white;
}

.btn-view:hover {
  background: #117a8b;
}

.btn-payment {
  background: var(--success-color);
  color: white;
}

.btn-payment:hover {
  background: #1e7e34;
}

.btn-edit {
  background: var(--warning-color);
  color: #212529;
}

.btn-edit:hover {
  background: #e0a800;
}

.btn-pdf {
  background: var(--danger-color);
  color: white;
}

.btn-pdf:hover {
  background: #bd2130;
}

.btn-delete {
  background: var(--secondary-color);
  color: white;
}

.btn-delete:hover {
  background: #545b62;
}

/* Messages */
.message-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius);
  color: white;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1001;
  animation: slideInRight 0.3s ease;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.message-notification.success {
  background: var(--success-color);
}

.message-notification.error {
  background: var(--danger-color);
}

.message-notification.info {
  background: var(--info-color);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Loading */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1002;
}

.loading-spinner {
  text-align: center;
  color: var(--primary-color);
}

.loading-spinner i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading-spinner p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}
</style>

<template>
  <div class="factures-container">
    <!-- En-tête avec tableau de bord -->
    <div class="dashboard-header">
      <div class="page-title">
        <h1>
          <i class="fas fa-file-invoice"></i>
          Gestion des Factures et Règlements
        </h1>
        <p class="subtitle">Suivi complet de votre facturation</p>
      </div>
      
      <!-- Tableau de bord rapide -->
      <div class="dashboard-cards">
        <div class="metric-card pending">
          <div class="metric-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="metric-content">
            <h3>{{ formatCurrency(dashboardStats.totalPending) }}</h3>
            <p>{{ dashboardStats.countPending }} En attente</p>
          </div>
        </div>
        
        <div class="metric-card paid">
          <div class="metric-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="metric-content">
            <h3>{{ formatCurrency(dashboardStats.totalPaid) }}</h3>
            <p>{{ dashboardStats.countPaid }} Réglées</p>
          </div>
        </div>
        
        <div class="metric-card overdue">
          <div class="metric-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="metric-content">
            <h3>{{ formatCurrency(dashboardStats.totalOverdue) }}</h3>
            <p>{{ dashboardStats.countOverdue }} En retard</p>
          </div>
        </div>
        
        <div class="metric-card partial">
          <div class="metric-icon">
            <i class="fas fa-coins"></i>
          </div>
          <div class="metric-content">
            <h3>{{ formatCurrency(dashboardStats.totalPartial) }}</h3>
            <p>{{ dashboardStats.countPartial }} Partielles</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Section de debug -->
    <div v-if="factures.length === 0 && !loading" class="debug-section">
      <h4>
        <i class="fas fa-bug"></i> Informations de debug
      </h4>
      <p><strong>Nombre de factures chargées :</strong> {{ factures.length }}</p>
      <p><strong>Nombre de factures filtrées :</strong> {{ filteredFactures.length }}</p>
      <p><strong>Nombre de partenaires :</strong> {{ partners.length }}</p>
      <p><strong>Token présent :</strong> {{ !!getToken() }}</p>
      <div style="margin-top: 1rem; display: flex; gap: 1rem;">
        <button @click="debugFactures" class="btn-secondary">
          <i class="fas fa-bug"></i> Debug console
        </button>
        <button @click="testConnection" class="btn-primary">
          <i class="fas fa-wifi"></i> Tester connexion
        </button>
        <button @click="createTestFactures" class="btn-export">
          <i class="fas fa-plus"></i> Données de test
        </button>
      </div>
    </div>

    <!-- Actions et filtres -->
    <div class="controls-section">
      <div class="action-buttons">
        <button @click="openFactureForm" class="btn-primary">
          <i class="fas fa-plus"></i>
          Nouvelle Facture
        </button>
        <button @click="exportData" class="btn-export">
          <i class="fas fa-download"></i>
          Exporter
        </button>
      </div>

      <!-- Filtres -->
      <div class="filters-section">
        <div class="filter-card">
          <div class="filter-row">
            <div class="filter-group">
              <label>Type</label>
              <select v-model="filters.type">
                <option value="">Tous</option>
                <option value="customer">Clients</option>
                <option value="vendor">Fournisseurs</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Statut</label>
              <select v-model="filters.status">
                <option value="">Tous</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="PARTIEL">Partiel</option>
                <option value="REGLE">Réglé</option>
                <option value="RETARD">En retard</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Date de</label>
              <input type="date" v-model="filters.dateFrom" />
            </div>
            
            <div class="filter-group">
              <label>Date à</label>
              <input type="date" v-model="filters.dateTo" />
            </div>
            
            <div class="filter-group">
              <label>Recherche</label>
              <input 
                type="text" 
                v-model="filters.search" 
                placeholder="Numéro, partenaire..."
              />
            </div>
            
            <div class="filter-actions">
              <button @click="applyFilters" class="btn-filter">
                <i class="fas fa-search"></i>
              </button>
              <button @click="resetFilters" class="btn-reset">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alertes factures en retard -->
    <div v-if="alertes.length > 0" class="alertes-section">
      <div class="alert-card">
        <h3>
          <i class="fas fa-bell"></i>
          Alertes ({{ alertes.length }})
        </h3>
        <div class="alerts-list">
          <div 
            v-for="alerte in alertes.slice(0, 3)" 
            :key="alerte.id"
            class="alert-item"
            @click="viewFacture(alerte)"
          >
            <div class="alert-icon">
              <i class="fas fa-exclamation-circle"></i>
            </div>
            <div class="alert-content">
              <span class="alert-title">{{ alerte.DocumentNo }}</span>
              <span class="alert-details">
                {{ alerte.bPartnerName }} - {{ formatCurrency(alerte.remainingAmt) }}
                - Échue depuis {{ daysSinceOverdue(alerte.DateDue) }} jour(s)
              </span>
            </div>
          </div>
        </div>
        <button v-if="alertes.length > 3" @click="showAllAlertes" class="btn-show-all">
          Voir toutes les alertes ({{ alertes.length }})
        </button>
      </div>
    </div>

    <!-- Table des factures -->
    <div class="table-section">
      <div class="table-header">
        <h2>
          <i class="fas fa-list"></i>
          Liste des Factures ({{ factures.length }})
        </h2>
        <div class="table-controls">
          <select v-model="itemsPerPage">
            <option :value="25">25 par page</option>
            <option :value="50">50 par page</option>
            <option :value="100">100 par page</option>
          </select>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="factures-table">
          <thead>
            <tr>
              <th @click="sortBy('DocumentNo')" class="sortable">
                <span>Numéro</span>
                <i :class="getSortIcon('DocumentNo')"></i>
              </th>
              <th @click="sortBy('IsSOTrx')" class="sortable">
                <span>Type</span>
                <i :class="getSortIcon('IsSOTrx')"></i>
              </th>
              <th @click="sortBy('DateInvoiced')" class="sortable">
                <span>Date émission</span>
                <i :class="getSortIcon('DateInvoiced')"></i>
              </th>
              <th @click="sortBy('DateDue')" class="sortable">
                <span>Date échéance</span>
                <i :class="getSortIcon('DateDue')"></i>
              </th>
              <th>Partenaire</th>
              <th @click="sortBy('GrandTotal')" class="sortable amount-col">
                <span>Montant total</span>
                <i :class="getSortIcon('GrandTotal')"></i>
              </th>
              <th class="amount-col">Montant réglé</th>
              <th class="amount-col">Reste à payer</th>
              <th>Statut</th>
              <th class="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <!-- Message si aucune facture -->
            <tr v-if="paginatedFactures.length === 0 && !loading">
              <td colspan="10" style="text-align: center; padding: 2rem; color: #6c757d;">
                <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                <div v-if="factures.length === 0">
                  Aucune facture trouvée. 
                  <button @click="loadFactures" class="btn-primary" style="margin-left: 1rem;">
                    <i class="fas fa-refresh"></i> Recharger
                  </button>
                </div>
                <div v-else>
                  Aucune facture ne correspond aux filtres appliqués.
                  <button @click="resetFilters" class="btn-secondary" style="margin-left: 1rem;">
                    <i class="fas fa-times"></i> Réinitialiser les filtres
                  </button>
                </div>
              </td>
            </tr>
            
            <!-- Lignes de facture -->
            <tr 
              v-for="facture in paginatedFactures" 
              :key="facture.id || facture.C_Invoice_ID"
              class="facture-row"
              :class="getRowClass(facture)"
            >
              <td class="document-cell">
                <div class="document-number">
                  {{ facture.DocumentNo || 'N/A' }}
                </div>
              </td>
              
              <td class="type-cell">
                <span :class="getTypeClass(facture.IsSOTrx)">
                  {{ facture.IsSOTrx ? 'Client' : 'Fournisseur' }}
                </span>
              </td>
              
              <td class="date-cell">
                {{ formatDate(facture.DateInvoiced) }}
              </td>
              
              <td class="date-cell">
                {{ formatDate(facture.DateDue) }}
              </td>
              
              <td class="partner-cell">
                <div class="partner-info">
                  <span class="partner-name">{{ facture.bPartnerName || 'Inconnu' }}</span>
                  <span class="partner-code">{{ facture.bPartnerValue || 'N/A' }}</span>
                </div>
              </td>
              
              <td class="amount-cell">
                <span class="amount-value">
                  {{ formatCurrency(facture.GrandTotal || 0) }}
                </span>
              </td>
              
              <td class="amount-cell">
                <span class="amount-paid">
                  {{ formatCurrency(facture.totalPaid || 0) }}
                </span>
              </td>
              
              <td class="amount-cell">
                <span class="amount-remaining" :class="getAmountClass(facture.remainingAmt || 0)">
                  {{ formatCurrency(facture.remainingAmt || 0) }}
                </span>
              </td>
              
              <td class="status-cell">
                <span :class="getStatusClass(facture.paymentStatus || 'EN_ATTENTE')">
                  {{ getStatusLabel(facture.paymentStatus || 'EN_ATTENTE') }}
                </span>
              </td>
              
              <td class="actions-cell">
                <button 
                  @click="viewFacture(facture)" 
                  class="btn-action btn-view"
                  title="Voir détails"
                >
                  <i class="fas fa-eye"></i>
                </button>
                
                <button 
                  @click="generatePDF(facture)" 
                  class="btn-action btn-pdf"
                  title="Générer PDF"
                >
                  <i class="fas fa-file-pdf"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="message" class="message-notification" :class="message.type">
      <i :class="message.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
      {{ message.text }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Chargement...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import * as fonction from '../js/fonction.js';

export default {
  name: 'FacturesPage',
  setup() {
    // États réactifs
    const loading = ref(false);
    const factures = ref([]);
    const partners = ref([]);
    const message = ref(null);
    const showFactureModal = ref(false);
    const selectedFacture = ref(null);

    // Filtres
    const filters = ref({
      type: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });

    // Tri et pagination
    const sortField = ref('DateInvoiced');
    const sortDirection = ref('desc');
    const currentPage = ref(1);
    const itemsPerPage = ref(25);

    // Méthodes utilitaires
    function getToken() {
      return sessionStorage.getItem('authToken');
    }

    function showMessage(text, type = 'info') {
      message.value = { text, type };
      setTimeout(() => {
        message.value = null;
      }, 5000);
    }

    function formatDate(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('fr-FR');
    }

    function formatCurrency(amount) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount || 0);
    }

    // Computed properties
    const dashboardStats = computed(() => {
      const stats = {
        totalPending: 0,
        countPending: 0,
        totalPaid: 0,
        countPaid: 0,
        totalOverdue: 0,
        countOverdue: 0,
        totalPartial: 0,
        countPartial: 0
      };

      factures.value.forEach(facture => {
        const amount = parseFloat(facture.GrandTotal || 0);
        switch (facture.paymentStatus) {
          case 'EN_ATTENTE':
            stats.totalPending += amount;
            stats.countPending++;
            break;
          case 'REGLE':
            stats.totalPaid += amount;
            stats.countPaid++;
            break;
          case 'RETARD':
            stats.totalOverdue += amount;
            stats.countOverdue++;
            break;
          case 'PARTIEL':
            stats.totalPartial += amount;
            stats.countPartial++;
            break;
        }
      });

      return stats;
    });

    const alertes = computed(() => {
      return factures.value.filter(facture => {
        const today = new Date();
        const dueDate = new Date(facture.DateDue);
        return dueDate < today && facture.paymentStatus !== 'REGLE';
      }).sort((a, b) => new Date(a.DateDue) - new Date(b.DateDue));
    });

    const filteredFactures = computed(() => {
      let filtered = factures.value;

      if (filters.value.type) {
        filtered = filtered.filter(f => 
          (filters.value.type === 'customer' && f.IsSOTrx) ||
          (filters.value.type === 'vendor' && !f.IsSOTrx)
        );
      }

      if (filters.value.status) {
        filtered = filtered.filter(f => f.paymentStatus === filters.value.status);
      }

      if (filters.value.dateFrom) {
        filtered = filtered.filter(f => f.DateInvoiced >= filters.value.dateFrom);
      }

      if (filters.value.dateTo) {
        filtered = filtered.filter(f => f.DateInvoiced <= filters.value.dateTo);
      }

      if (filters.value.search) {
        const search = filters.value.search.toLowerCase();
        filtered = filtered.filter(f => 
          (f.DocumentNo || '').toLowerCase().includes(search) ||
          (f.bPartnerName || '').toLowerCase().includes(search)
        );
      }

      // Tri
      if (sortField.value) {
        filtered.sort((a, b) => {
          let valueA = a[sortField.value];
          let valueB = b[sortField.value];

          if (sortField.value.includes('Date')) {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
          }

          if (sortDirection.value === 'asc') {
            return valueA > valueB ? 1 : -1;
          } else {
            return valueA < valueB ? 1 : -1;
          }
        });
      }

      return filtered;
    });

    const paginatedFactures = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredFactures.value.slice(start, end);
    });

    // Fonctions principales - VERSION MODIFIÉE POUR 2025
    async function loadFactures() {
      loading.value = true;
      try {
        console.log('Chargement des factures...');
        
        const token = getToken();
        if (!token) {
          showMessage('Token d\'authentification manquant. Veuillez vous reconnecter.', 'error');
          return;
        }

        // D'abord, charger TOUTES les factures pour voir ce qu'on a
        const result = await fonction.getIDempiereModels(token, 'c_invoice');
        console.log('Toutes les factures trouvées:', result);
        
        if (!result || !result.records || result.records.length === 0) {
          console.log('Aucune facture trouvée');
          factures.value = [];
          showMessage('Aucune facture trouvée dans iDempiere.', 'info');
          return;
        }

        // Analyser les dates des factures existantes
        const facturesDates = result.records.map(f => ({
          id: f.id,
          dateInvoiced: f.DateInvoiced,
          dateDue: f.DateDue,
          year: f.DateInvoiced ? new Date(f.DateInvoiced).getFullYear() : 'N/A'
        }));
        
        console.log('Analyse des dates des factures:', facturesDates);
        
        // Compter les factures par année
        const facturesParAnnee = facturesDates.reduce((acc, f) => {
          const year = f.year;
          acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {});
        
        console.log('Factures par année:', facturesParAnnee);
        
        // Filtrer les factures de 2025 (ou utiliser toutes si pas de 2025)
        let factures2025 = result.records.filter(f => {
          if (!f.DateInvoiced) return false;
          const year = new Date(f.DateInvoiced).getFullYear();
          return year === 2025;
        });
        
        console.log(`Factures 2025 trouvées: ${factures2025.length}`);
        
        // Si pas de factures 2025, proposer des options
        if (factures2025.length === 0) {
          const anneeDisponibles = Object.keys(facturesParAnnee).filter(y => y !== 'N/A').join(', ');
          
          const choix = confirm(`Aucune facture de 2025 trouvée.
          
Factures disponibles par année: ${anneeDisponibles}
Total: ${result.records.length} factures

Voulez-vous :
- OUI: Voir TOUTES les factures (toutes années)
- NON: Créer des factures de test 2025`);
          
          if (choix) {
            // Utiliser toutes les factures existantes
            factures2025 = result.records;
            showMessage(`Affichage de ${result.records.length} factures (toutes années)`, 'info');
          } else {
            // Créer des factures de test 2025
            createTestFactures2025();
            return;
          }
        }

        // Traitement des factures sélectionnées
        const enrichedFactures = await Promise.all(
          factures2025.map(async (facture) => {
            console.log('Traitement facture:', facture);
            
            // Charger les informations du partenaire
            let partnerName = 'Partenaire Inconnu';
            let partnerValue = 'N/A';
            
            if (facture.C_BPartner_ID) {
              try {
                const partner = await fonction.getIDempiereModel(
                  token, 'c_bpartner', facture.C_BPartner_ID
                );
                if (partner) {
                  partnerName = partner.Name || 'Nom manquant';
                  partnerValue = partner.Value || partner.SearchKey || 'Code manquant';
                }
              } catch (error) {
                console.warn('Erreur chargement partenaire:', error);
              }
            }

            // Calculer le statut de paiement
            const grandTotal = parseFloat(facture.GrandTotal || 0);
            const totalPaid = 0; // À améliorer avec les vrais règlements
            
            let paymentStatus = 'EN_ATTENTE';
            
            // Vérifier si la facture est en retard
            if (facture.DateDue) {
              const today = new Date();
              const dueDate = new Date(facture.DateDue);
              
              if (totalPaid >= grandTotal) {
                paymentStatus = 'REGLE';
              } else if (totalPaid > 0) {
                paymentStatus = 'PARTIEL';
              } else if (dueDate < today) {
                paymentStatus = 'RETARD';
              }
            }

            // Assurer que les dates sont formatées correctement
            const dateInvoiced = facture.DateInvoiced || new Date().toISOString().split('T')[0];
            const dateDue = facture.DateDue || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];

            return {
              ...facture,
              bPartnerName: partnerName,
              bPartnerValue: partnerValue,
              totalPaid,
              remainingAmt: grandTotal - totalPaid,
              paymentStatus,
              payments: [],
              DocumentNo: facture.DocumentNo || `FACT-${facture.id}`,
              DateInvoiced: dateInvoiced,
              DateDue: dateDue,
              IsSOTrx: Boolean(facture.IsSOTrx),
              GrandTotal: grandTotal
            };
          })
        );

        factures.value = enrichedFactures;
        console.log('Factures enrichies finales:', enrichedFactures);
        
        const message = factures2025.length === result.records.length 
          ? `${enrichedFactures.length} factures chargées (toutes années)`
          : `${enrichedFactures.length} factures 2025 chargées`;
          
        showMessage(message, 'success');

      } catch (error) {
        console.error('Erreur loadFactures:', error);
        showMessage('Erreur lors du chargement: ' + error.message, 'error');
        
        // En cas d'erreur, proposer les données de test
        const useTestData = confirm('Erreur de chargement. Utiliser des données de test 2025 ?');
        if (useTestData) {
          createTestFactures2025();
        }
      } finally {
        loading.value = false;
      }
    }

    async function loadPartners() {
      try {
        console.log('Chargement des partenaires...');
        const token = getToken();
        if (!token) return;

        const result = await fonction.getIDempiereModels(token, 'c_bpartner');
        console.log('Résultat partenaires:', result);
        
        if (result && result.records) {
          partners.value = result.records.filter(p => p.IsActive !== false);
          console.log('Partenaires chargés:', partners.value.length);
        } else {
          partners.value = [];
        }
      } catch (error) {
        console.error('Erreur chargement partenaires:', error);
        partners.value = [];
      }
    }

    // NOUVELLE FONCTION - Créer des factures de test 2025
    function createTestFactures2025() {
      console.log('Création de factures de test 2025...');
      
      factures.value = [
        {
          id: 2025001,
          DocumentNo: 'FACT-2025-001',
          IsSOTrx: true,
          DateInvoiced: '2025-01-15',
          DateDue: '2025-02-15',
          bPartnerName: 'Client Test 2025',
          bPartnerValue: 'CLI2025-001',
          GrandTotal: 1500.00,
          totalPaid: 0,
          remainingAmt: 1500.00,
          paymentStatus: 'EN_ATTENTE',
          payments: []
        },
        {
          id: 2025002,
          DocumentNo: 'FACT-2025-002',
          IsSOTrx: true,
          DateInvoiced: '2025-02-01',
          DateDue: '2025-03-01',
          bPartnerName: 'Entreprise Innovation',
          bPartnerValue: 'CLI2025-002',
          GrandTotal: 2400.00,
          totalPaid: 1200.00,
          remainingAmt: 1200.00,
          paymentStatus: 'PARTIEL',
          payments: []
        },
        {
          id: 2025003,
          DocumentNo: 'FOUR-2025-001',
          IsSOTrx: false,
          DateInvoiced: '2025-01-08',
          DateDue: '2025-02-08',
          bPartnerName: 'Fournisseur Matériel',
          bPartnerValue: 'FOUR2025-001',
          GrandTotal: 800.00,
          totalPaid: 0,
          remainingAmt: 800.00,
          paymentStatus: 'EN_ATTENTE',
          payments: []
        },
        {
          id: 2025004,
          DocumentNo: 'FACT-2025-003',
          IsSOTrx: true,
          DateInvoiced: '2025-03-10',
          DateDue: '2025-04-10',
          bPartnerName: 'Société Services Consulting',
          bPartnerValue: 'CLI2025-003',
          GrandTotal: 3200.00,
          totalPaid: 3200.00,
          remainingAmt: 0,
          paymentStatus: 'REGLE',
          payments: []
        },
        {
          id: 2025005,
          DocumentNo: 'FACT-2025-004',
          IsSOTrx: true,
          DateInvoiced: '2025-06-01',
          DateDue: '2025-05-01', // En retard
          bPartnerName: 'Client en Retard',
          bPartnerValue: 'CLI2025-004',
          GrandTotal: 1800.00,
          totalPaid: 0,
          remainingAmt: 1800.00,
          paymentStatus: 'RETARD',
          payments: []
        }
      ];
      
      showMessage('5 factures de test 2025 créées!', 'success');
      console.log('Factures 2025 créées:', factures.value);
    }

    // NOUVELLE FONCTION - Créer de vraies factures 2025 dans iDempiere
    async function createRealFactures2025() {
      loading.value = true;
      try {
        const token = getToken();
        if (!token) {
          throw new Error('Token manquant');
        }

        // Utiliser le premier partenaire disponible
        const firstPartnerId = partners.value.length > 0 ? partners.value[0].id : 118;
        
        console.log('Création de factures 2025 avec partenaire ID:', firstPartnerId);
        
        const facturesToCreate = [
          {
            AD_Org_ID: { id: 11 },
            AD_Client_ID: { id: 11 },
            C_DocType_ID: { id: 127 }, // Facture client
            C_BPartner_ID: { id: firstPartnerId },
            DateInvoiced: "2025-01-15",
            DateAcct: "2025-01-15",
            DateDue: "2025-02-15",
            C_Currency_ID: { id: 100 },
            IsSOTrx: true,
            DocStatus: "DR",
            Description: "Facture test 2025 - Client",
            GrandTotal: 1200.00,
            TotalLines: 1000.00,
            TaxAmt: 200.00
          },
          {
            AD_Org_ID: { id: 11 },
            AD_Client_ID: { id: 11 },
            C_DocType_ID: { id: 125 }, // Facture fournisseur
            C_BPartner_ID: { id: firstPartnerId },
            DateInvoiced: "2025-02-01",
            DateAcct: "2025-02-01",
            DateDue: "2025-03-01",
            C_Currency_ID: { id: 100 },
            IsSOTrx: false,
            DocStatus: "DR",
            Description: "Facture test 2025 - Fournisseur",
            GrandTotal: 800.00,
            TotalLines: 666.67,
            TaxAmt: 133.33
          }
        ];

        const createdFactures = [];
        
        for (const factureData of facturesToCreate) {
          try {
            console.log('Création facture:', factureData);
            const result = await fonction.creationtable(token, 'c_invoice', factureData);
            console.log('Facture créée:', result);
            createdFactures.push(result);
          } catch (error) {
            console.error('Erreur création facture individuelle:', error);
          }
        }
        
        if (createdFactures.length > 0) {
          showMessage(`${createdFactures.length} factures 2025 créées dans iDempiere!`, 'success');
          // Recharger les données
          setTimeout(() => loadFactures(), 1000);
        } else {
          throw new Error('Aucune facture créée');
        }
        
      } catch (error) {
        console.error('Erreur création factures 2025:', error);
        showMessage('Erreur création: ' + error.message, 'error');
        
        // Fallback vers données de test
        const useTestData = confirm('Impossible de créer dans iDempiere. Utiliser des données de test ?');
        if (useTestData) {
          createTestFactures2025();
        }
      } finally {
        loading.value = false;
      }
    }

    // FONCTION MODIFIÉE - Ancienne fonction avec données 2024
    function createTestFactures() {
      console.log('Création de factures de test 2024...');
      factures.value = [
        {
          id: 1001,
          DocumentNo: 'FACT-2024-001',
          IsSOTrx: true,
          DateInvoiced: '2024-01-15',
          DateDue: '2024-02-15',
          bPartnerName: 'SARL Martin & Associés',
          bPartnerValue: 'CLI001',
          GrandTotal: 1200.00,
          totalPaid: 0,
          remainingAmt: 1200.00,
          paymentStatus: 'EN_ATTENTE',
          payments: []
        },
        {
          id: 1002,
          DocumentNo: 'FACT-2024-002',
          IsSOTrx: false,
          DateInvoiced: '2024-01-10',
          DateDue: '2024-01-05',
          bPartnerName: 'Fournitures Bureau Plus',
          bPartnerValue: 'FOUR001',
          GrandTotal: 800.00,
          totalPaid: 400.00,
          remainingAmt: 400.00,
          paymentStatus: 'RETARD',
          payments: []
        },
        {
          id: 1003,
          DocumentNo: 'FACT-2024-003',
          IsSOTrx: true,
          DateInvoiced: '2024-01-20',
          DateDue: '2024-02-20',
          bPartnerName: 'Entreprise Dupont',
          bPartnerValue: 'CLI002',
          GrandTotal: 1500.00,
          totalPaid: 1500.00,
          remainingAmt: 0,
          paymentStatus: 'REGLE',
          payments: []
        },
        {
          id: 1004,
          DocumentNo: 'FACT-2024-004',
          IsSOTrx: true,
          DateInvoiced: '2024-02-01',
          DateDue: '2024-03-01',
          bPartnerName: 'SAS Technologie Avancée',
          bPartnerValue: 'CLI003',
          GrandTotal: 2400.00,
          totalPaid: 1200.00,
          remainingAmt: 1200.00,
          paymentStatus: 'PARTIEL',
          payments: []
        }
      ];
      
      showMessage('Factures de test 2024 créées avec succès!', 'success');
    }

    async function testConnection() {
      loading.value = true;
      try {
        console.log('Test de connexion à iDempiere...');
        const token = getToken();
        
        if (!token) {
          throw new Error('Token d\'authentification manquant');
        }
        
        const clientTest = await fonction.getIDempiereModels(token, 'ad_client');
        console.log('Résultat test client:', clientTest);
        
        if (clientTest && clientTest.records) {
          showMessage(`Connexion OK - ${clientTest.records.length} clients trouvés`, 'success');
          await loadFactures();
        } else {
          throw new Error('Test de connexion échoué');
        }
        
      } catch (error) {
        console.error('Erreur test connexion:', error);
        showMessage('Erreur de connexion: ' + error.message, 'error');
        
        const useTestData = confirm('Erreur de connexion à iDempiere. Voulez-vous utiliser des données de démonstration ?');
        if (useTestData) {
          createTestFactures2025();
        }
      } finally {
        loading.value = false;
      }
    }

    function debugFactures() {
      console.log('=== DEBUG FACTURES ===');
      console.log('Token présent:', !!getToken());
      console.log('Nombre de factures:', factures.value.length);
      console.log('Factures:', factures.value);
      console.log('Factures filtrées:', filteredFactures.value.length);
      console.log('Factures paginées:', paginatedFactures.value.length);
      console.log('==================');
      
      showMessage(`${factures.value.length} factures chargées, ${filteredFactures.value.length} filtrées, ${paginatedFactures.value.length} affichées`, 'info');
    }

    function openFactureForm() {
      showMessage('Fonctionnalité en cours de développement', 'info');
    }

    function viewFacture(facture) {
      selectedFacture.value = facture;
      showMessage(`Affichage détail facture ${facture.DocumentNo}`, 'info');
    }

    function generatePDF(facture) {
      const printWindow = window.open('', '_blank');
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Facture ${facture.DocumentNo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FACTURE ${facture.DocumentNo}</h1>
            <p>Date: ${formatDate(facture.DateInvoiced)}</p>
          </div>
          <div class="info">
            <p><strong>Client:</strong> ${facture.bPartnerName}</p>
            <p><strong>Montant:</strong> ${formatCurrency(facture.GrandTotal)}</p>
            <p><strong>Statut:</strong> ${getStatusLabel(facture.paymentStatus)}</p>
          </div>
        </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }

    function exportData() {
      const headers = ['Numéro', 'Type', 'Date émission', 'Date échéance', 'Partenaire', 'Montant total', 'Statut'];
      const csvData = [
        headers.join(';'),
        ...filteredFactures.value.map(facture => [
          facture.DocumentNo,
          facture.IsSOTrx ? 'Client' : 'Fournisseur',
          formatDate(facture.DateInvoiced),
          formatDate(facture.DateDue),
          facture.bPartnerName,
          facture.GrandTotal,
          getStatusLabel(facture.paymentStatus)
        ].join(';'))
      ].join('\n');

      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `factures_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    }

    function sortBy(field) {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortField.value = field;
        sortDirection.value = 'asc';
      }
    }

    function getSortIcon(field) {
      if (sortField.value !== field) return 'fas fa-sort';
      return sortDirection.value === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }

    function applyFilters() {
      currentPage.value = 1;
    }

    function resetFilters() {
      filters.value = {
        type: '',
        status: '',
        dateFrom: '',
        dateTo: '',
        search: ''
      };
      currentPage.value = 1;
    }

    function showAllAlertes() {
      filters.value.status = 'RETARD';
      applyFilters();
    }

    function daysSinceOverdue(dateStr) {
      const today = new Date();
      const dueDate = new Date(dateStr);
      const diffTime = today - dueDate;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    function getRowClass(facture) {
      return {
        'row-overdue': facture.paymentStatus === 'RETARD',
        'row-paid': facture.paymentStatus === 'REGLE',
        'row-partial': facture.paymentStatus === 'PARTIEL'
      };
    }

    function getTypeClass(isSOTrx) {
      return isSOTrx ? 'type-customer' : 'type-vendor';
    }

    function getStatusClass(status) {
      return `status-${status.toLowerCase().replace('_', '-')}`;
    }

    function getAmountClass(amount) {
      if (amount > 0) return 'amount-positive';
      if (amount < 0) return 'amount-negative';
      return 'amount-zero';
    }

    function getStatusLabel(status) {
      const labels = {
        'EN_ATTENTE': 'En attente',
        'PARTIEL': 'Partiel',
        'REGLE': 'Réglé',
        'RETARD': 'En retard'
      };
      return labels[status] || status;
    }

    // Lifecycle
    onMounted(async () => {
      console.log('Composant monté, chargement des données...');
      try {
        if (!getToken()) {
          showMessage('Veuillez vous connecter pour accéder aux factures', 'error');
          return;
        }
        
        await loadPartners();
        await loadFactures();
      } catch (error) {
        console.error('Erreur lors du chargement initial:', error);
        showMessage('Erreur lors du chargement des données', 'error');
      }
    });

    return {
      // États
      loading,
      factures,
      partners,
      message,
      showFactureModal,
      selectedFacture,
      // Filtres et tri
      filters,
      sortField,
      sortDirection,
      currentPage,
      itemsPerPage,
      // Computed
      dashboardStats,
      alertes,
      filteredFactures,
      paginatedFactures,
      // Méthodes
      getToken,
      loadFactures,
      createTestFactures,
      createTestFactures2025,    // NOUVELLE FONCTION
      createRealFactures2025,    // NOUVELLE FONCTION
      testConnection,
      debugFactures,
      openFactureForm,
      viewFacture,
      generatePDF,
      exportData,
      sortBy,
      getSortIcon,
      applyFilters,
      resetFilters,
      showAllAlertes,
      daysSinceOverdue,
      getRowClass,
      getTypeClass,
      getStatusClass,
      getAmountClass,
      getStatusLabel,
      formatDate,
      formatCurrency
    };
  }
};
</script>