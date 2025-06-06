<template>
  <div class="rapport-container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">
          <i class="icon-accounts"></i>
          Liste des Comptes
        </h1>
        <p class="page-subtitle">Gérez et consultez vos comptes comptables</p>
      </div>
      <div class="header-stats">
        <div class="stat-card">
          <div class="stat-number">{{ comptes.length }}</div>
          <div class="stat-label">Total Comptes</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ comptesFiltres.length }}</div>
          <div class="stat-label">Affichés</div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="filter-group">
        <label for="type-select" class="filter-label">
          <i class="icon-filter"></i>
          Filtrer par type
        </label>
        <div class="select-wrapper">
          <select v-model="selectedType" id="type-select" class="filter-select">
            <option value="">Tous les types</option>
            <option v-for="type in typesDisponibles" :key="type.id" :value="type.id">
              {{ type.label }}
            </option>
          </select>
          <i class="select-arrow"></i>
        </div>
      </div>

      <div class="filter-group">
        <label for="search-input" class="filter-label">
          <i class="icon-search"></i>
          Rechercher
        </label>
        <input 
          v-model="searchTerm" 
          id="search-input"
          type="text" 
          placeholder="Nom ou numéro du compte..." 
          class="search-input"
        >
      </div>

      <button 
        v-if="selectedType || searchTerm" 
        @click="clearFilters"
        class="clear-filters-btn"
      >
        <i class="icon-clear"></i>
        Effacer les filtres
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-section">
      <div class="loading-spinner"></div>
      <p>Chargement des comptes...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="comptesFiltres.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">📊</div>
      <h3>Aucun compte trouvé</h3>
      <p>{{ searchTerm || selectedType ? 'Essayez de modifier vos filtres' : 'Aucun compte disponible' }}</p>
    </div>

    <!-- Table Section -->
    <div v-else class="table-section">
      <div class="table-header">
        <h3>Résultats ({{ comptesFiltres.length }})</h3>
        <div class="table-actions">
          <button class="export-btn">
            <i class="icon-export"></i>
            Exporter
          </button>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="comptes-table">
          <thead>
            <tr>
              <th class="sortable" @click="sortBy('Value')">
                Numéro
                <i class="sort-icon" :class="getSortIcon('Value')"></i>
              </th>
              <th class="sortable" @click="sortBy('Name')">
                Nom du Compte
                <i class="sort-icon" :class="getSortIcon('Name')"></i>
              </th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="compte in paginatedComptes" 
              :key="compte.C_ElementValue_ID"
              class="table-row"
            >
              <td class="account-number">
                <span class="number-badge">{{ compte.Value }}</span>
              </td>
              <td class="account-name">
                <div class="name-cell">
                  <span class="name-text">{{ compte.Name }}</span>
                </div>
              </td>
              <td class="account-type">
                <span 
                  class="type-badge" 
                  :class="`type-${compte.AccountType?.id?.toLowerCase()}`"
                >
                  {{ getTypeLabel(compte.AccountType?.id) }}
                </span>
              </td>
              <td class="actions">
                <button class="action-btn view-btn" title="Voir les détails">
                  <i class="icon-eye"></i>
                </button>
                <button class="action-btn edit-btn" title="Modifier">
                  <i class="icon-edit"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-section">
        <div class="pagination-info">
          Affichage {{ startItem }}-{{ endItem }} sur {{ comptesFiltres.length }} comptes
        </div>
        <div class="pagination-controls">
          <button 
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="pagination-btn"
          >
            Précédent
          </button>
          <span class="page-numbers">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              :class="['page-btn', { active: page === currentPage }]"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
          </span>
          <button 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="pagination-btn"
          >
            Suivant
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
      itemsPerPage: 10,
      allAccountTypes: [
        { id: 'A', label: 'Actif', color: 'blue' },
        { id: 'E', label: 'Charge', color: 'red' },
        { id: 'L', label: 'Passif', color: 'orange' },
        { id: 'M', label: 'Mémo', color: 'gray' },
        { id: 'O', label: 'Capitaux Propres', color: 'green' },
        { id: 'R', label: 'Produit', color: 'purple' }
      ]
    };
  },
  computed: {
    typesDisponibles() {
      return this.allAccountTypes;
    },
    comptesFiltres() {
      let filtered = this.comptes;
      
      // Filter by type
      if (this.selectedType) {
        filtered = filtered.filter(c => c.AccountType?.id === this.selectedType);
      }
      
      // Filter by search term
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        filtered = filtered.filter(c => 
          c.Name?.toLowerCase().includes(term) || 
          c.Value?.toString().includes(term)
        );
      }
      
      // Sort
      if (this.sortField) {
        filtered.sort((a, b) => {
          let aVal = a[this.sortField] || '';
          let bVal = b[this.sortField] || '';
          
          if (typeof aVal === 'string') aVal = aVal.toLowerCase();
          if (typeof bVal === 'string') bVal = bVal.toLowerCase();
          
          if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
          if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
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
        // You might want to show a toast notification here
      } finally {
        this.loading = false;
      }
    },
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
      this.currentPage = 1;
    },
    getSortIcon(field) {
      if (this.sortField !== field) return 'icon-sort';
      return this.sortDirection === 'asc' ? 'icon-sort-up' : 'icon-sort-down';
    },
    getTypeLabel(typeId) {
      const type = this.allAccountTypes.find(t => t.id === typeId);
      return type ? type.label : typeId;
    },
    clearFilters() {
      this.selectedType = '';
      this.searchTerm = '';
      this.currentPage = 1;
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
/* Variables CSS */
:root {
  --primary-color: #3b82f6;
  --primary-dark: #2563eb;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --border-color: #e2e8f0;
  --bg-gray-50: #f8fafc;
  --bg-gray-100: #f1f5f9;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
}

/* Container principal */
.rapport-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
  min-height: 100vh;
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--border-color);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 1rem;
}

.stat-card {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-lg);
  text-align: center;
  min-width: 100px;
  box-shadow: var(--shadow-md);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Filters Section */
.filters-section {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-gray-50);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.filter-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.select-wrapper {
  position: relative;
}

.filter-select, .search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  background: white;
  transition: all 0.2s ease;
}

.filter-select:focus, .search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

.select-wrapper::after {
  content: '▼';
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.clear-filters-btn {
  padding: 0.75rem 1.5rem;
  background: var(--error-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.clear-filters-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Loading Section */
.loading-section {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

/* Table Section */
.table-section {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--bg-gray-50);
  border-bottom: 1px solid var(--border-color);
}

.table-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
}

.export-btn {
  padding: 0.5rem 1rem;
  background: var(--success-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.export-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

/* Table */
.table-wrapper {
  overflow-x: auto;
}

.comptes-table {
  width: 100%;
  border-collapse: collapse;
}

.comptes-table th {
  background: var(--bg-gray-50);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  white-space: nowrap;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.sortable:hover {
  background: var(--bg-gray-100);
}

.sort-icon {
  margin-left: 0.5rem;
  opacity: 0.5;
}

.comptes-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.table-row:hover {
  background: var(--bg-gray-50);
}

.number-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
}

.name-cell {
  display: flex;
  align-items: center;
}

.name-text {
  font-weight: 500;
  color: var(--text-primary);
}

.type-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.type-a { background: #dbeafe; color: #1d4ed8; }
.type-e { background: #fee2e2; color: #dc2626; }
.type-l { background: #fed7aa; color: #ea580c; }
.type-m { background: #f3f4f6; color: #374151; }
.type-o { background: #dcfce7; color: #16a34a; }
.type-r { background: #ede9fe; color: #7c3aed; }

.actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  background: white;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.edit-btn:hover {
  background: var(--warning-color);
  color: white;
  border-color: var(--warning-color);
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--bg-gray-50);
  border-top: 1px solid var(--border-color);
}

.pagination-info {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn, .page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: white;
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.pagination-btn:hover:not(:disabled), .page-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

/* Icons (using CSS pseudo-elements for simplicity) */
.icon-accounts::before { content: '📊'; }
.icon-filter::before { content: '🔍'; }
.icon-search::before { content: '🔎'; }
.icon-clear::before { content: '✖️'; }
.icon-export::before { content: '📤'; }
.icon-eye::before { content: '👁️'; }
.icon-edit::before { content: '✏️'; }
.icon-sort::before { content: '↕️'; }
.icon-sort-up::before { content: '↑'; }
.icon-sort-down::before { content: '↓'; }

/* Responsive Design */
@media (max-width: 768px) {
  .rapport-container {
    padding: 1rem;
  }
  
  .header-section {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-stats {
    width: 100%;
    justify-content: center;
  }
  
  .filters-section {
    flex-direction: column;
    gap: 1rem;
  }
  
  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .pagination-section {
    flex-direction: column;
    gap: 1rem;
  }
  
  .pagination-controls {
    justify-content: center;
  }
}
</style>