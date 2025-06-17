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
        
        <!-- Menu d'exportation amélioré -->
        <div class="export-dropdown" @mouseenter="showExportMenu = true" @mouseleave="showExportMenu = false">
          <button class="btn-export dropdown-trigger">
            <i class="fas fa-download"></i>
            Exporter
            <i class="fas fa-chevron-down"></i>
          </button>
          
          <div v-if="showExportMenu" class="export-menu">
            <button @click="exportToPDF" class="export-item">
              <i class="fas fa-file-pdf"></i>
              <div class="export-content">
                <span class="export-title">PDF Détaillé</span>
                <span class="export-desc">Liste complète avec graphiques</span>
              </div>
            </button>
            
            <button @click="exportToExcel" class="export-item">
              <i class="fas fa-file-excel"></i>
              <div class="export-content">
                <span class="export-title">Excel</span>
                <span class="export-desc">Données structurées (.xlsx)</span>
              </div>
            </button>
            
            <button @click="exportToCSV" class="export-item">
              <i class="fas fa-file-csv"></i>
              <div class="export-content">
                <span class="export-title">CSV</span>
                <span class="export-desc">Import/export universel</span>
              </div>
            </button>
            
            <button @click="exportSelectedPDFs" class="export-item" :disabled="selectedFactures.length === 0">
              <i class="fas fa-file-pdf"></i>
              <div class="export-content">
                <span class="export-title">PDFs Sélectionnées</span>
                <span class="export-desc">{{ selectedFactures.length }} facture(s)</span>
              </div>
            </button>
            
            <button @click="openBulkEmailModal" class="export-item" :disabled="selectedFactures.length === 0">
              <i class="fas fa-envelope"></i>
              <div class="export-content">
                <span class="export-title">Envoi Email</span>
                <span class="export-desc">PDF par email</span>
              </div>
            </button>
          </div>
        </div>
        
        <!-- Sélection multiple -->
        <div class="selection-controls" v-if="selectedFactures.length > 0">
          <span class="selection-count">{{ selectedFactures.length }} sélectionnée(s)</span>
          <button @click="selectAll" class="btn-secondary">
            <i class="fas fa-check-square"></i>
            Tout sélectionner
          </button>
          <button @click="clearSelection" class="btn-secondary">
            <i class="fas fa-times"></i>
            Désélectionner
          </button>
        </div>
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
              <th class="checkbox-col">
                <input 
                  type="checkbox" 
                  @change="toggleSelectAll" 
                  :checked="allSelected"
                  class="checkbox-select"
                >
              </th>
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
              <td colspan="11" style="text-align: center; padding: 2rem; color: #6c757d;">
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
              <td class="checkbox-col">
                <input 
                  type="checkbox" 
                  :value="facture" 
                  v-model="selectedFactures"
                  class="checkbox-select"
                >
              </td>
              
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
                <div class="action-buttons-row">
                  <button 
                    @click="viewFacture(facture)" 
                    class="btn-action btn-view"
                    title="Voir détails"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  
                  <button 
                    @click="generateSinglePDF(facture)" 
                    class="btn-action btn-pdf"
                    title="Générer PDF"
                  >
                    <i class="fas fa-file-pdf"></i>
                  </button>
                  
                  <button 
                    @click="sendFactureByEmail(facture)" 
                    class="btn-action btn-email"
                    title="Envoyer par email"
                  >
                    <i class="fas fa-envelope"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          class="pagination-btn" 
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <i class="fas fa-chevron-left"></i> Précédent
        </button>
        
        <div class="pagination-numbers">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            class="pagination-btn page-number"
            :class="{ 'active': page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          class="pagination-btn" 
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          Suivant <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Modal d'envoi email groupé -->
    <div v-if="showBulkEmailModal" class="modal-overlay" @click="closeBulkEmailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Envoi groupé par email</h3>
          <button @click="closeBulkEmailModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <p>{{ selectedFactures.length }} facture(s) sélectionnée(s) :</p>
          <ul class="selected-list">
            <li v-for="facture in selectedFactures.slice(0, 5)" :key="facture.id">
              {{ facture.DocumentNo }} - {{ facture.bPartnerName }}
            </li>
            <li v-if="selectedFactures.length > 5">
              ... et {{ selectedFactures.length - 5 }} autres
            </li>
          </ul>
          
          <div class="form-group">
            <label>Sujet de l'email :</label>
            <input 
              v-model="emailSubject" 
              type="text" 
              class="form-control"
              placeholder="Votre facture..."
            >
          </div>
          
          <div class="form-group">
            <label>Message :</label>
            <textarea 
              v-model="emailMessage" 
              class="form-control"
              rows="4"
              placeholder="Bonjour,&#10;&#10;Veuillez trouver ci-joint votre facture...&#10;&#10;Cordialement"
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeBulkEmailModal" class="btn-secondary">
            Annuler
          </button>
          <button @click="sendBulkEmails" class="btn-primary" :disabled="loading">
            <i class="fas fa-paper-plane"></i>
            Envoyer {{ selectedFactures.length }} email(s)
          </button>
        </div>
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
        <p>{{ loadingMessage || 'Chargement...' }}</p>
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
    const loadingMessage = ref('');
    const factures = ref([]);
    const partners = ref([]);
    const message = ref(null);
    const showFactureModal = ref(false);
    const selectedFacture = ref(null);
    const selectedFactures = ref([]);
    const showExportMenu = ref(false);
    const showBulkEmailModal = ref(false);
    const emailSubject = ref('Votre facture');
    const emailMessage = ref('Bonjour,\n\nVeuillez trouver ci-joint votre facture.\n\nCordialement');

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

    const totalPages = computed(() => {
      return Math.ceil(filteredFactures.value.length / itemsPerPage.value);
    });

    const paginatedFactures = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredFactures.value.slice(start, end);
    });

    const visiblePages = computed(() => {
      const pages = [];
      const total = totalPages.value;
      const current = currentPage.value;
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        if (current > 4) pages.push('...');
        
        const start = Math.max(2, current - 2);
        const end = Math.min(total - 1, current + 2);
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        
        if (current < total - 3) pages.push('...');
        pages.push(total);
      }
      
      return pages;
    });

    const allSelected = computed(() => {
      return paginatedFactures.value.length > 0 && 
             selectedFactures.value.length === paginatedFactures.value.length;
    });

    // Fonctions de chargement des données
    async function loadFactures() {
      loading.value = true;
      loadingMessage.value = 'Chargement des factures...';
      try {
        console.log('Chargement des factures...');
        
        const token = getToken();
        if (!token) {
          showMessage('Token d\'authentification manquant. Veuillez vous reconnecter.', 'error');
          return;
        }

        const result = await fonction.getIDempiereModels(token, 'c_invoice');
        console.log('Toutes les factures trouvées:', result);
        
        if (!result || !result.records || result.records.length === 0) {
          console.log('Aucune facture trouvée');
          factures.value = [];
          showMessage('Aucune facture trouvée dans iDempiere.', 'info');
          return;
        }

        // Analyser les dates et filtrer les factures récentes
        let facturesRecentes = result.records.filter(f => {
          if (!f.DateInvoiced) return false;
          const year = new Date(f.DateInvoiced).getFullYear();
          return year >= 2024; // Factures de 2024 et plus récentes
        });
        
        console.log(`Factures récentes trouvées: ${facturesRecentes.length}`);
        
        if (facturesRecentes.length === 0) {
          const choix = confirm(`Aucune facture récente trouvée.
          
Total: ${result.records.length} factures

Voulez-vous :
- OUI: Voir TOUTES les factures
- NON: Créer des factures de test`);
          
          if (choix) {
            facturesRecentes = result.records;
            showMessage(`Affichage de ${result.records.length} factures (toutes années)`, 'info');
          } else {
            createTestFactures();
            return;
          }
        }

        // Enrichissement des factures
        loadingMessage.value = 'Enrichissement des données...';
        const enrichedFactures = await Promise.all(
          facturesRecentes.map(async (facture) => {
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

            const grandTotal = parseFloat(facture.GrandTotal || 0);
            const totalPaid = 0;
            
            let paymentStatus = 'EN_ATTENTE';
            
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
        
        showMessage(`${enrichedFactures.length} factures chargées avec succès`, 'success');

      } catch (error) {
        console.error('Erreur loadFactures:', error);
        showMessage('Erreur lors du chargement: ' + error.message, 'error');
        
        const useTestData = confirm('Erreur de chargement. Utiliser des données de test ?');
        if (useTestData) {
          createTestFactures();
        }
      } finally {
        loading.value = false;
        loadingMessage.value = '';
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

    function createTestFactures() {
      console.log('Création de factures de test...');
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
          DateDue: '2025-05-01',
          bPartnerName: 'Client en Retard',
          bPartnerValue: 'CLI2025-004',
          GrandTotal: 1800.00,
          totalPaid: 0,
          remainingAmt: 1800.00,
          paymentStatus: 'RETARD',
          payments: []
        }
      ];
      
      showMessage('5 factures de test créées!', 'success');
    }

    // Fonctions d'exportation

    async function exportToPDF() {
      loading.value = true;
      loadingMessage.value = 'Génération du PDF...';
      
      try {
        // Créer le contenu HTML pour le PDF
        const htmlContent = generatePDFContent();
        
        // Ouvrir dans une nouvelle fenêtre pour impression/sauvegarde
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Auto-print après un court délai
        setTimeout(() => {
          printWindow.print();
        }, 500);
        
        showMessage('PDF généré avec succès', 'success');
      } catch (error) {
        console.error('Erreur génération PDF:', error);
        showMessage('Erreur lors de la génération du PDF', 'error');
      } finally {
        loading.value = false;
        loadingMessage.value = '';
      }
    }

    function generatePDFContent() {
      const today = new Date().toLocaleDateString('fr-FR');
      const stats = dashboardStats.value;
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Rapport Factures - ${today}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #007bff;
              padding-bottom: 20px;
            }
            .header h1 { 
              color: #007bff; 
              margin: 0;
              font-size: 2em;
            }
            .stats-grid { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 20px; 
              margin: 30px 0; 
            }
            .stat-card { 
              border: 1px solid #ddd; 
              padding: 20px; 
              border-radius: 8px;
              background: #f8f9fa;
            }
            .stat-title { 
              font-weight: bold; 
              color: #007bff; 
              margin-bottom: 10px;
            }
            .stat-value { 
              font-size: 1.5em; 
              font-weight: bold; 
            }
            .table-section { 
              margin-top: 30px; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            th { 
              background: #007bff; 
              color: white; 
              font-weight: bold;
            }
            tr:nth-child(even) { 
              background: #f8f9fa; 
            }
            .status-en-attente { 
              background: #fff3cd; 
              color: #856404; 
              padding: 4px 8px; 
              border-radius: 4px; 
            }
            .status-regle { 
              background: #d4edda; 
              color: #155724; 
              padding: 4px 8px; 
              border-radius: 4px; 
            }
            .status-retard { 
              background: #f8d7da; 
              color: #721c24; 
              padding: 4px 8px; 
              border-radius: 4px; 
            }
            .status-partiel { 
              background: #d1ecf1; 
              color: #0c5460; 
              padding: 4px 8px; 
              border-radius: 4px; 
            }
            .amount { 
              text-align: right; 
              font-weight: bold;
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              color: #666; 
              font-size: 0.9em;
            }
            @media print {
              body { margin: 0; }
              .header { page-break-after: avoid; }
              tr { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Rapport des Factures</h1>
            <p>Généré le ${today}</p>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-title">💰 En Attente</div>
              <div class="stat-value">${formatCurrency(stats.totalPending)}</div>
              <div>${stats.countPending} facture(s)</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-title">✅ Réglées</div>
              <div class="stat-value">${formatCurrency(stats.totalPaid)}</div>
              <div>${stats.countPaid} facture(s)</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-title">⚠️ En Retard</div>
              <div class="stat-value">${formatCurrency(stats.totalOverdue)}</div>
              <div>${stats.countOverdue} facture(s)</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-title">🔄 Partielles</div>
              <div class="stat-value">${formatCurrency(stats.totalPartial)}</div>
              <div>${stats.countPartial} facture(s)</div>
            </div>
          </div>
          
          <div class="table-section">
            <h2>Liste des Factures (${filteredFactures.value.length})</h2>
            <table>
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Type</th>
                  <th>Date Émission</th>
                  <th>Date Échéance</th>
                  <th>Partenaire</th>
                  <th>Montant Total</th>
                  <th>Reste à Payer</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                ${filteredFactures.value.map(facture => `
                  <tr>
                    <td>${facture.DocumentNo}</td>
                    <td>${facture.IsSOTrx ? 'Client' : 'Fournisseur'}</td>
                    <td>${formatDate(facture.DateInvoiced)}</td>
                    <td>${formatDate(facture.DateDue)}</td>
                    <td>${facture.bPartnerName}</td>
                    <td class="amount">${formatCurrency(facture.GrandTotal)}</td>
                    <td class="amount">${formatCurrency(facture.remainingAmt)}</td>
                    <td><span class="status-${facture.paymentStatus.toLowerCase().replace('_', '-')}">${getStatusLabel(facture.paymentStatus)}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>Rapport généré automatiquement par ComptaVision</p>
            <p>Total des factures: ${filteredFactures.value.length} | Montant global: ${formatCurrency(filteredFactures.value.reduce((sum, f) => sum + (f.GrandTotal || 0), 0))}</p>
          </div>
        </body>
        </html>
      `;
    }

    async function exportToExcel() {
      loading.value = true;
      loadingMessage.value = 'Génération du fichier Excel...';
      
      try {
        // Préparer les données pour Excel
        const excelData = [
          // En-têtes
          ['Numéro', 'Type', 'Date Émission', 'Date Échéance', 'Partenaire', 'Code Partenaire', 'Montant Total', 'Montant Réglé', 'Reste à Payer', 'Statut'],
          // Données
          ...filteredFactures.value.map(facture => [
            facture.DocumentNo,
            facture.IsSOTrx ? 'Client' : 'Fournisseur',
            formatDate(facture.DateInvoiced),
            formatDate(facture.DateDue),
            facture.bPartnerName,
            facture.bPartnerValue,
            facture.GrandTotal,
            facture.totalPaid,
            facture.remainingAmt,
            getStatusLabel(facture.paymentStatus)
          ])
        ];
        
        // Créer le contenu CSV (compatible Excel)
        const csvContent = excelData.map(row => 
          row.map(cell => `"${cell}"`).join(';')
        ).join('\n');
        
        // Ajouter BOM pour l'encodage UTF-8
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { 
          type: 'text/csv;charset=utf-8;' 
        });
        
        // Télécharger
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `factures_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        showMessage('Fichier Excel exporté avec succès', 'success');
      } catch (error) {
        console.error('Erreur export Excel:', error);
        showMessage('Erreur lors de l\'export Excel', 'error');
      } finally {
        loading.value = false;
        loadingMessage.value = '';
      }
    }

    async function exportToCSV() {
      loading.value = true;
      loadingMessage.value = 'Génération du fichier CSV...';
      
      try {
        const headers = ['Numéro', 'Type', 'Date Émission', 'Date Échéance', 'Partenaire', 'Montant Total', 'Reste à Payer', 'Statut'];
        const csvData = [
          headers.join(','),
          ...filteredFactures.value.map(facture => [
            `"${facture.DocumentNo}"`,
            `"${facture.IsSOTrx ? 'Client' : 'Fournisseur'}"`,
            `"${formatDate(facture.DateInvoiced)}"`,
            `"${formatDate(facture.DateDue)}"`,
            `"${facture.bPartnerName}"`,
            facture.GrandTotal,
            facture.remainingAmt,
            `"${getStatusLabel(facture.paymentStatus)}"`
          ].join(','))
        ].join('\n');

        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `factures_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        showMessage('Fichier CSV exporté avec succès', 'success');
      } catch (error) {
        console.error('Erreur export CSV:', error);
        showMessage('Erreur lors de l\'export CSV', 'error');
      } finally {
        loading.value = false;
        loadingMessage.value = '';
      }
    }

    async function generateSinglePDF(facture) {
      loading.value = true;
      loadingMessage.value = `Génération PDF pour ${facture.DocumentNo}...`;
      
      try {
        const htmlContent = generateSingleFacturePDF(facture);
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        setTimeout(() => {
          printWindow.print();
        }, 500);
        
        showMessage(`PDF généré pour la facture ${facture.DocumentNo}`, 'success');
      } catch (error) {
        console.error('Erreur génération PDF individuel:', error);
        showMessage('Erreur lors de la génération du PDF', 'error');
      } finally {
        loading.value = false;
        loadingMessage.value = '';
      }
    }

    function generateSingleFacturePDF(facture) {
      const today = new Date().toLocaleDateString('fr-FR');
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Facture ${facture.DocumentNo}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              color: #333;
              line-height: 1.6;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center;
              border-bottom: 3px solid #007bff;
              padding-bottom: 20px;
              margin-bottom: 40px;
            }
            .company-info h1 { 
              color: #007bff; 
              margin: 0;
              font-size: 2.5em;
            }
            .invoice-info { 
              text-align: right; 
            }
            .invoice-number { 
              font-size: 1.5em; 
              font-weight: bold; 
              color: #007bff;
            }
            .info-section { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 40px; 
              margin: 40px 0; 
            }
            .info-block h3 { 
              color: #007bff; 
              border-bottom: 1px solid #ddd; 
              padding-bottom: 10px;
            }
            .details-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 40px 0;
            }
            .details-table th, .details-table td { 
              border: 1px solid #ddd; 
              padding: 15px; 
              text-align: left; 
            }
            .details-table th { 
              background: #007bff; 
              color: white; 
            }
            .amount-section { 
              margin-top: 40px; 
              text-align: right;
            }
            .total-amount { 
              font-size: 1.5em; 
              font-weight: bold; 
              color: #007bff;
              padding: 20px;
              border: 2px solid #007bff;
              border-radius: 8px;
              display: inline-block;
            }
            .status-badge { 
              padding: 8px 16px; 
              border-radius: 20px; 
              font-weight: bold;
              display: inline-block;
              margin-top: 20px;
            }
            .footer { 
              margin-top: 60px; 
              text-align: center; 
              color: #666; 
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <h1>ComptaVision</h1>
              <p>Gestion de facturation<br>
              123 Rue de l'Entreprise<br>
              75000 Paris, France</p>
            </div>
            <div class="invoice-info">
              <div class="invoice-number">FACTURE</div>
              <div class="invoice-number">${facture.DocumentNo}</div>
              <p>Date: ${formatDate(facture.DateInvoiced)}<br>
              Échéance: ${formatDate(facture.DateDue)}</p>
            </div>
          </div>
          
          <div class="info-section">
            <div class="info-block">
              <h3>Facturer à :</h3>
              <p><strong>${facture.bPartnerName}</strong><br>
              Code: ${facture.bPartnerValue}<br>
              Type: ${facture.IsSOTrx ? 'Client' : 'Fournisseur'}</p>
            </div>
            
            <div class="info-block">
              <h3>Informations de paiement :</h3>
              <p>Statut: <span class="status-badge" style="background: ${getStatusColor(facture.paymentStatus)}; color: white;">${getStatusLabel(facture.paymentStatus)}</span><br>
              Montant réglé: ${formatCurrency(facture.totalPaid)}<br>
              Reste à payer: ${formatCurrency(facture.remainingAmt)}</p>
            </div>
          </div>
          
          <table class="details-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Numéro de facture</td>
                <td>${facture.DocumentNo}</td>
              </tr>
              <tr>
                <td>Type de document</td>
                <td>${facture.IsSOTrx ? 'Facture Client' : 'Facture Fournisseur'}</td>
              </tr>
              <tr>
                <td>Date d'émission</td>
                <td>${formatDate(facture.DateInvoiced)}</td>
              </tr>
              <tr>
                <td>Date d'échéance</td>
                <td>${formatDate(facture.DateDue)}</td>
              </tr>
              <tr>
                <td>Partenaire commercial</td>
                <td>${facture.bPartnerName} (${facture.bPartnerValue})</td>
              </tr>
            </tbody>
          </table>
          
          <div class="amount-section">
            <div class="total-amount">
              Montant Total: ${formatCurrency(facture.GrandTotal)}
            </div>
          </div>
          
          <div class="footer">
            <p>Merci pour votre confiance</p>
            <p>Document généré le ${today} par ComptaVision</p>
          </div>
        </body>
        </html>
      `;
    }

    async function exportSelectedPDFs() {
      if (selectedFactures.value.length === 0) {
        showMessage('Aucune facture sélectionnée', 'warning');
        return;
      }
      
      loading.value = true;
      loadingMessage.value = `Génération de ${selectedFactures.value.length} PDF(s)...`;
      
      try {
        for (let i = 0; i < selectedFactures.value.length; i++) {
          const facture = selectedFactures.value[i];
          loadingMessage.value = `Génération PDF ${i + 1}/${selectedFactures.value.length}: ${facture.DocumentNo}`;
          
          const htmlContent = generateSingleFacturePDF(facture);
          
          const printWindow = window.open('', '_blank');
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          
          // Délai entre chaque ouverture
          if (i < selectedFactures.value.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        showMessage(`${selectedFactures.value.length} PDF(s) généré(s) avec succès`, 'success');
      } catch (error) {
        console.error('Erreur génération PDFs multiples:', error);
        showMessage('Erreur lors de la génération des PDFs', 'error');
      } finally {
        loading.value = false;
        loadingMessage.value = '';
      }
    }

    // Fonctions de sélection
    function toggleSelectAll() {
      if (allSelected.value) {
        selectedFactures.value = [];
      } else {
        selectedFactures.value = [...paginatedFactures.value];
      }
    }

    function selectAll() {
      selectedFactures.value = [...filteredFactures.value];
    }

    function clearSelection() {
      selectedFactures.value = [];
    }

    // Fonctions d'email
    function openBulkEmailModal() {
      showBulkEmailModal.value = true;
    }

    function closeBulkEmailModal() {
      showBulkEmailModal.value = false;
    }

    async function sendFactureByEmail(facture) {
      // Simulation d'envoi d'email
      showMessage(`Email envoyé pour la facture ${facture.DocumentNo}`, 'success');
    }

    async function sendBulkEmails() {
      loading.value = true;
      loadingMessage.value = `Envoi de ${selectedFactures.value.length} email(s)...`;
      
      try {
        // Simulation d'envoi groupé
        for (let i = 0; i < selectedFactures.value.length; i++) {
          const facture = selectedFactures.value[i];
          loadingMessage.value = `Envoi email ${i + 1}/${selectedFactures.value.length}: ${facture.DocumentNo}`;
          
          // Simulation du délai d'envoi
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        showMessage(`${selectedFactures.value.length} email(s) envoyé(s) avec succès`, 'success');
        closeBulkEmailModal();
        clearSelection();
      } catch (error) {
        console.error('Erreur envoi emails:', error);
        showMessage('Erreur lors de l\'envoi des emails', 'error');
      } finally {
        loading.value = false;
        loadingMessage.value = '';
      }
    }

    // Fonctions utilitaires pour PDF
    function getStatusColor(status) {
      const colors = {
        'EN_ATTENTE': '#ffc107',
        'PARTIEL': '#17a2b8',
        'REGLE': '#28a745',
        'RETARD': '#dc3545'
      };
      return colors[status] || '#6c757d';
    }

    // Fonctions existantes
    async function testConnection() {
      loading.value = true;
      try {
        const token = getToken();
        if (!token) {
          throw new Error('Token d\'authentification manquant');
        }
        
        const clientTest = await fonction.getIDempiereModels(token, 'ad_client');
        
        if (clientTest && clientTest.records) {
          showMessage(`Connexion OK - ${clientTest.records.length} clients trouvés`, 'success');
          await loadFactures();
        } else {
          throw new Error('Test de connexion échoué');
        }
      } catch (error) {
        console.error('Erreur test connexion:', error);
        showMessage('Erreur de connexion: ' + error.message, 'error');
        
        const useTestData = confirm('Erreur de connexion. Utiliser des données de test ?');
        if (useTestData) {
          createTestFactures();
        }
      } finally {
        loading.value = false;
      }
    }

    function debugFactures() {
      console.log('=== DEBUG FACTURES ===');
      console.log('Token présent:', !!getToken());
      console.log('Nombre de factures:', factures.value.length);
      console.log('Factures sélectionnées:', selectedFactures.value.length);
      console.log('Factures filtrées:', filteredFactures.value.length);
      console.log('==================');
      
      showMessage(`${factures.value.length} factures, ${selectedFactures.value.length} sélectionnées`, 'info');
    }

    function openFactureForm() {
      showMessage('Fonctionnalité en cours de développement', 'info');
    }

    function viewFacture(facture) {
      selectedFacture.value = facture;
      showMessage(`Affichage détail facture ${facture.DocumentNo}`, 'info');
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

    function goToPage(page) {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
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
      loadingMessage,
      factures,
      partners,
      message,
      showFactureModal,
      selectedFacture,
      selectedFactures,
      showExportMenu,
      showBulkEmailModal,
      emailSubject,
      emailMessage,
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
      totalPages,
      visiblePages,
      allSelected,
      // Méthodes principales
      getToken,
      loadFactures,
      createTestFactures,
      testConnection,
      debugFactures,
      openFactureForm,
      viewFacture,
      // Exportations
      exportToPDF,
      exportToExcel,
      exportToCSV,
      generateSinglePDF,
      exportSelectedPDFs,
      // Sélection
      toggleSelectAll,
      selectAll,
      clearSelection,
      // Email
      openBulkEmailModal,
      closeBulkEmailModal,
      sendFactureByEmail,
      sendBulkEmails,
      // Navigation et tri
      sortBy,
      getSortIcon,
      applyFilters,
      resetFilters,
      showAllAlertes,
      daysSinceOverdue,
      goToPage,
      // Classes CSS
      getRowClass,
      getTypeClass,
      getStatusClass,
      getAmountClass,
      getStatusLabel,
      getStatusColor,
      // Formatage
      formatDate,
      formatCurrency
    };
  }
};
</script>

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
  align-items: center;
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

/* Dropdown d'exportation */
.export-dropdown {
  position: relative;
}

.dropdown-trigger {
  cursor: pointer;
}

.export-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 280px;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  padding: 0.75rem;
  margin-top: 0.5rem;
  z-index: 1000;
  border: 1px solid #e2e8f0;
}

.export-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  color: #374151;
  background: none;
  border: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  margin-bottom: 0.25rem;
  width: 100%;
  text-align: left;
}

.export-item:last-child {
  margin-bottom: 0;
}

.export-item:hover:not(:disabled) {
  background: #f8fafc;
  color: #667eea;
  transform: translateX(4px);
}

.export-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.export-item i {
  font-size: 1.25rem;
  width: 2rem;
  text-align: center;
  flex-shrink: 0;
}

.export-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.export-title {
  font-weight: 600;
  font-size: 0.9rem;
}

.export-desc {
  font-size: 0.8rem;
  color: #64748b;
}

/* Contrôles de sélection */
.selection-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: #e3f2fd;
  border-radius: var(--border-radius);
  border: 1px solid #2196f3;
}

.selection-count {
  font-weight: 600;
  color: #1976d2;
}

/* Checkbox */
.checkbox-col {
  width: 40px;
  text-align: center;
}

.checkbox-select {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* Actions dans le tableau */
.action-buttons-row {
  display: flex;
  gap: 0.25rem;
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
}

.btn-view {
  background: var(--info-color);
  color: white;
}

.btn-view:hover {
  background: #117a8b;
}

.btn-pdf {
  background: var(--danger-color);
  color: white;
}

.btn-pdf:hover {
  background: #bd2130;
}

.btn-email {
  background: var(--warning-color);
  color: #212529;
}

.btn-email:hover {
  background: #e0a800;
}

/* Pagination améliorée */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
  background: #f1f5f9;
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.pagination-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-number {
  min-width: 40px;
  justify-content: center;
}

.page-number.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  color: var(--dark-color);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--secondary-color);
}

.modal-close:hover {
  color: var(--danger-color);
}

.modal-body {
  padding: 1.5rem;
}

.selected-list {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  max-height: 150px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--dark-color);
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  transition: var(--transition);
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

/* Styles existants pour les filtres */
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

.message-notification.warning {
  background: var(--warning-color);
  color: #212529;
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

/* Responsive */
@media (max-width: 768px) {
  .factures-container {
    padding: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  .selection-controls {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .filter-row {
    grid-template-columns: 1fr;
  }
  
  .dashboard-cards {
    grid-template-columns: 1fr;
  }
  
  .export-menu {
    right: 0;
    left: auto;
    min-width: 250px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
  
  .pagination-numbers {
    order: -1;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>