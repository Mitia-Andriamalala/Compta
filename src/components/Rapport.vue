<template>
  <div class="page-container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <span class="title-icon">📊</span>
            Liste des Comptes
          </h1>
          <p class="page-subtitle">Gérez et consultez tous vos comptes comptables</p>
        </div>
        <div class="header-stats">
          <div class="stat-card">
            <div class="stat-icon">📋</div>
            <div class="stat-content">
              <div class="stat-number">{{ comptes.length }}</div>
              <div class="stat-label">Total Comptes</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🔍</div>
            <div class="stat-content">
              <div class="stat-number">{{ comptesFiltres.length }}</div>
              <div class="stat-label">Affichés</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Search and Filter Section -->
      <div class="search-section">
        <div class="filters-grid">
          <!-- Search -->
          <div class="search-container">
            <div class="search-icon">🔍</div>
            <input
              type="text"
              v-model="searchTerm"
              placeholder="Rechercher par nom ou numéro de compte..."
              class="search-input"
            />
            <div class="search-clear" v-if="searchTerm" @click="searchTerm = ''">✕</div>
          </div>

          <!-- Type Filter -->
          <div class="filter-container">
            <select v-model="selectedType" class="filter-select">
              <option value="">Tous les types</option>
              <option v-for="type in typesDisponibles" :key="type.id" :value="type.id">
                {{ type.label }}
              </option>
            </select>
          </div>

          <!-- Clear Filters -->
          <button 
            v-if="selectedType || searchTerm" 
            @click="clearFilters"
            class="clear-filters-btn"
          >
            ✕ Effacer les filtres
          </button>
        </div>

        <div class="results-count" v-if="searchTerm || selectedType">
          {{ comptesFiltres.length }} résultat(s) trouvé(s)
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des comptes...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="comptesFiltres.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>Aucun compte trouvé</h3>
        <p>{{ searchTerm || selectedType ? 'Essayez de modifier vos filtres' : 'Aucun compte disponible' }}</p>
        <button v-if="searchTerm || selectedType" @click="clearFilters" class="retry-btn">
          Réinitialiser les filtres
        </button>
      </div>

      <!-- Accounts Grid -->
      <div v-else class="accounts-grid">
        <div 
          v-for="compte in paginatedComptes" 
          :key="compte.C_ElementValue_ID"
          @click="viewDetails(compte)"
          class="account-card"
          :class="`type-${compte.AccountType?.id?.toLowerCase()}`"
        >
          <!-- Card Header -->
          <div class="card-header">
            <div class="account-number">{{ compte.Value }}</div>
            <div class="account-type-icon">
              {{ getTypeIcon(compte.AccountType?.id) }}
            </div>
          </div>

          <!-- Account Name -->
          <h3 class="account-name">{{ compte.Name }}</h3>

          <!-- Account Type -->
          <div class="account-type-section">
            <span 
              class="type-badge" 
              :class="`type-${compte.AccountType?.id?.toLowerCase()}`"
            >
              {{ getTypeLabel(compte.AccountType?.id) }}
            </span>
          </div>

          <!-- Card Footer -->
          <div class="card-footer">
            <span class="view-details">Voir les détails →</span>
            <div class="action-buttons">
              <button class="action-btn view-btn" @click.stop="viewDetails(compte)" title="Voir les détails">
                👁️
              </button>
              <button class="action-btn edit-btn" @click.stop="editAccount(compte)" title="Modifier">
                ✏️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1 && !loading" class="pagination-section">
        <div class="pagination-info">
          <span class="results-text">
            Affichage <strong>{{ startItem }}-{{ endItem }}</strong> sur <strong>{{ comptesFiltres.length }}</strong> comptes
          </span>
        </div>
        <div class="pagination-controls">
          <button 
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="pagination-btn"
          >
            ← Précédent
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              :class="['page-btn', { active: page === currentPage }]"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="pagination-btn"
          >
            Suivant →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Rapport',
  data() {
    return {
      comptes: [],
      selectedType: '',
      searchTerm: '',
      loading: true,
      sortField: '',
      sortDirection: 'asc',
      currentPage: 1,
      itemsPerPage: 12,
      allAccountTypes: [
        { id: 'A', label: 'Actif', icon: '📈' },
        { id: 'E', label: 'Charge', icon: '💸' },
        { id: 'L', label: 'Passif', icon: '📉' },
        { id: 'M', label: 'Mémo', icon: '📝' },
        { id: 'O', label: 'Capitaux Propres', icon: '💰' },
        { id: 'R', label: 'Produit', icon: '💹' }
      ]
    };
  },
  computed: {
    typesDisponibles() {
      return this.allAccountTypes;
    },
    comptesFiltres() {
      let filtered = this.comptes;
      
      if (this.selectedType) {
        filtered = filtered.filter(c => c.AccountType?.id === this.selectedType);
      }
      
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        filtered = filtered.filter(c => 
          c.Name?.toLowerCase().includes(term) || 
          c.Value?.toString().includes(term)
        );
      }
      
      return filtered;
    },
    totalPages() {
      return Math.ceil(this.comptesFiltres.length / this.itemsPerPage);
    },
    paginatedComptes() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.comptesFiltres.slice(start, end);
    },
    startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.comptesFiltres.length);
    },
    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, this.currentPage + 2);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    }
  },
  methods: {
    async loadComptes() {
      this.loading = true;
      const token = sessionStorage.getItem('authToken');
      
      try {
        const response = await axios.get('/api/v1/models/C_ElementValue', {
          params: {
            fields: 'C_ElementValue_ID,Value,Name,AccountType'
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.comptes = response.data.records || [];
      } catch (error) {
        console.error('Erreur lors du chargement des comptes:', error);
      } finally {
        this.loading = false;
      }
    },
    getTypeLabel(typeId) {
      const type = this.allAccountTypes.find(t => t.id === typeId);
      return type ? type.label : typeId || 'Inconnu';
    },
    getTypeIcon(typeId) {
      const type = this.allAccountTypes.find(t => t.id === typeId);
      return type ? type.icon : '📋';
    },
    clearFilters() {
      this.selectedType = '';
      this.searchTerm = '';
      this.currentPage = 1;
    },
    viewDetails(compte) {
      console.log('Voir détails:', compte);
      // Ajouter votre logique de navigation ici
    },
    editAccount(compte) {
      console.log('Modifier compte:', compte);
      // Ajouter votre logique d'édition ici
    }
  },
  watch: {
    selectedType() {
      this.currentPage = 1;
    },
    searchTerm() {
      this.currentPage = 1;
    }
  },
  async mounted() {
    await this.loadComptes();
  }
}
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
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  z-index: 1;
}

.title-section {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
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

.header-stats {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  min-width: 140px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.25);
}

.stat-icon {
  font-size: 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.875rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
  font-weight: 500;
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

.filters-grid {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 1rem;
  align-items: center;
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

.filter-container {
  position: relative;
}

.filter-select {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.3s ease;
  outline: none;
  cursor: pointer;
}

.filter-select:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.clear-filters-btn {
  padding: 1rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.clear-filters-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.results-count {
  margin-top: 0.75rem;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
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

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

/* Accounts Grid */
.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
  transition: transform 0.3s ease;
}

.account-card.type-a::before {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

.account-card.type-e::before {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.account-card.type-l::before {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.account-card.type-m::before {
  background: linear-gradient(90deg, #6b7280, #4b5563);
}

.account-card.type-o::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.account-card.type-r::before {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.account-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.account-card:hover::before {
  transform: scaleX(1);
}

.account-card::before {
  transform: scaleX(0);
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

.account-type-icon {
  font-size: 1.5rem;
}

/* Account Name */
.account-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

/* Account Type Section */
.account-type-section {
  margin-bottom: 1.5rem;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.875rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.type-badge.type-a { 
  background: #dbeafe; 
  color: #1d4ed8;
}

.type-badge.type-e { 
  background: #fee2e2; 
  color: #dc2626;
}

.type-badge.type-l { 
  background: #fed7aa; 
  color: #ea580c;
}

.type-badge.type-m { 
  background: #f3f4f6; 
  color: #374151;
}

.type-badge.type-o { 
  background: #dcfce7; 
  color: #16a34a;
}

.type-badge.type-r { 
  background: #ede9fe; 
  color: #7c3aed;
}

/* Card Footer */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.view-btn:hover {
  background: #3b82f6;
  border-color: #3b82f6;
  transform: scale(1.05);
}

.edit-btn:hover {
  background: #f59e0b;
  border-color: #f59e0b;
  transform: scale(1.05);
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.pagination-info .results-text {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

.pagination-info strong {
  color: #1e293b;
  font-weight: 700;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pagination-btn {
  padding: 0.75rem 1.25rem;
  border: 2px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  font-weight: 600;
}

.pagination-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8fafc;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  min-width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 2px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-1px);
}

.page-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
    align-items: center;
  }
  
  .header-stats {
    justify-content: center;
    align-items: center;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .clear-filters-btn {
    width: 100%;
  }
}

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
  
  .pagination-section {
    flex-direction: column;
    gap: 1rem;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
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
  
  .account-type-icon {
    align-self: flex-end;
  }
  
  .stat-card {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .stat-icon {
    align-self: center;
  }
  
  .page-numbers {
    display: none;
  }
}
</style>