<template>
  <div class="page-container">
    <!-- Section de Debug - Supprimez cette section une fois que tout fonctionne -->
    <div v-if="debugMode" class="debug-panel" style="background: #fff3cd; border: 2px solid #ffc107; padding: 1rem; margin: 1rem; border-radius: 8px;">
      <h3>🔧 Mode Debug</h3>
      <div style="font-size: 0.8rem; font-family: monospace;">
        <p><strong>Année sélectionnée:</strong> {{ selectedYear }}</p>
        <p><strong>Années disponibles:</strong> {{ availableYears.join(', ') }}</p>
        <p><strong>Données brutes:</strong> {{ financialData.length }} éléments</p>
        <p><strong>Données filtrées:</strong> {{ filteredData.length }} éléments</p>
        <p><strong>Is Loading:</strong> {{ isLoading }}</p>
        <p><strong>Error:</strong> {{ error }}</p>
        <p><strong>Type de graphique:</strong> {{ chartType }}</p>
        <details style="margin-top: 1rem;">
          <summary>Voir données brutes</summary>
          <pre style="background: #f8f9fa; padding: 1rem; overflow: auto; max-height: 200px;">{{ JSON.stringify(filteredData, null, 2) }}</pre>
        </details>
      </div>
      <button @click="debugMode = false" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: #dc3545; color: white; border: none; border-radius: 4px;">
        Fermer Debug
      </button>
    </div>

    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <span class="title-icon">📊</span>
            Tableau de bord financier
          </h1>
          <p class="page-subtitle">Analyse des performances financières en temps réel</p>
        </div>
        <div class="header-controls">
        <div class="year-filter">
          <label for="year-select" class="filter-label">Période d'analyse</label>
          <div class="select-wrapper">
            <select v-model="selectedYear" id="year-select" class="year-select" :disabled="isLoading">
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
        </div>
        <div class="action-buttons">
          <button class="btn btn-refresh" @click="refreshData" :disabled="isLoading">
            <span class="btn-icon" :class="{ 'spinning': isLoading }">🔄</span>
            Actualiser
          </button>
          <button class="btn btn-debug" @click="debugMode = !debugMode" :class="{ 'active': debugMode }">
            🔧 Debug
          </button>
          <div class="export-dropdown" ref="exportDropdown">
            <button class="btn btn-export" @click="toggleExportMenu">
              <span class="btn-icon">📤</span>
              Exporter
              <span class="dropdown-arrow">▼</span>
            </button>
            <div v-if="showExportMenu" class="export-menu">
              <button @click="exportData('excel')" class="export-option">
                <span class="export-icon">📊</span>
                Excel (.xlsx)
              </button>
              <button @click="exportData('csv')" class="export-option">
                <span class="export-icon">📄</span>
                CSV (.csv)
              </button>
              <button @click="exportData('pdf')" class="export-option">
                <span class="export-icon">📑</span>
                PDF (.pdf)
              </button>
              <button @click="exportData('json')" class="export-option">
                <span class="export-icon">⚙️</span>
                JSON (.json)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Messages d'état -->
      <div v-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Erreur de chargement</h3>
        <p>{{ error }}</p>
        <button @click="fetchData" class="retry-btn">Réessayer</button>
      </div>

      <!-- Indicateur de chargement -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <h3>Chargement des données financières</h3>
        <p>Analyse en cours...</p>
      </div>

      <!-- Message si pas de données -->
      <div v-else-if="!error && filteredData.length === 0 && !isLoading" class="empty-data-state">
        <div class="empty-icon">📈</div>
        <h3>Aucune donnée financière</h3>
        <p>Aucune donnée trouvée pour l'année {{ selectedYear }}</p>
        <div class="empty-actions">
          <button @click="fetchData" class="retry-btn">Recharger</button>
          <button @click="debugMode = true" class="debug-btn">Voir Debug</button>
        </div>
      </div>

      <!-- Contenu principal -->
      <div v-else-if="!error && filteredData.length > 0">
        
        <!-- KPI Cards -->
        <div class="kpi-section">
          <div class="kpi-card revenue">
            <div class="card-header">
              <div class="kpi-icon">📈</div>
              <div class="kpi-trend positive">
                <span class="trend-indicator">↗️</span>
                +12.5%
              </div>
            </div>
            <div class="kpi-content">
              <h3 class="kpi-label">Chiffre d'affaires</h3>
              <div class="kpi-value">{{ formatCurrency(totals.chiffreAffaires) }}</div>
              <p class="kpi-description">Total des revenus {{ selectedYear }}</p>
            </div>
          </div>

          <div class="kpi-card expenses">
            <div class="card-header">
              <div class="kpi-icon">📉</div>
              <div class="kpi-trend negative">
                <span class="trend-indicator">↘️</span>
                -3.2%
              </div>
            </div>
            <div class="kpi-content">
              <h3 class="kpi-label">Charges totales</h3>
              <div class="kpi-value">{{ formatCurrency(totals.charges) }}</div>
              <p class="kpi-description">Total des dépenses {{ selectedYear }}</p>
            </div>
          </div>

          <div class="kpi-card profit" :class="{ 'positive-result': totals.resultatNet > 0, 'negative-result': totals.resultatNet < 0 }">
            <div class="card-header">
              <div class="kpi-icon">🎯</div>
              <div class="kpi-trend" :class="totals.resultatNet > 0 ? 'positive' : 'negative'">
                <span class="trend-indicator">{{ totals.resultatNet > 0 ? '↗️' : '↘️' }}</span>
                {{ totals.resultatNet > 0 ? '+' : '' }}18.7%
              </div>
            </div>
            <div class="kpi-content">
              <h3 class="kpi-label">Résultat net</h3>
              <div class="kpi-value" :class="{ 'positive': totals.resultatNet > 0, 'negative': totals.resultatNet < 0 }">
                {{ formatCurrency(totals.resultatNet) }}
              </div>
              <p class="kpi-description">Bénéfice après charges</p>
            </div>
          </div>

          <div class="kpi-card margin">
            <div class="card-header">
              <div class="kpi-icon">💹</div>
              <div class="kpi-trend positive">
                <span class="trend-indicator">↗️</span>
                +2.1%
              </div>
            </div>
            <div class="kpi-content">
              <h3 class="kpi-label">Marge nette</h3>
              <div class="kpi-value">{{ calculateMargin() }}%</div>
              <p class="kpi-description">Rentabilité globale</p>
            </div>
          </div>
        </div>

        <!-- Graphique Section -->
        <div class="chart-section">
          <div class="section-header">
            <div class="section-title">
              <h2>Évolution financière</h2>
              <p class="section-subtitle">Analyse mensuelle des performances</p>
            </div>
            <div class="chart-controls">
              <button 
                class="chart-btn" 
                :class="{ 'active': chartType === 'line' }"
                @click="changeChartType('line')"
              >
                📈 Ligne
              </button>
              <button 
                class="chart-btn" 
                :class="{ 'active': chartType === 'bar' }"
                @click="changeChartType('bar')"
              >
                📊 Barres
              </button>
            </div>
          </div>
          <div class="chart-container">
            <canvas ref="chartCanvas"></canvas>
          </div>
        </div>

        <!-- Tableau mensuel en cartes -->
        <div class="monthly-section">
          <div class="section-header">
            <div class="section-title">
              <h2>Détail mensuel</h2>
              <p class="section-subtitle">Performance mois par mois</p>
            </div>
            <div class="search-container">
              <div class="search-icon">🔍</div>
              <input type="text" v-model="searchQuery" placeholder="Rechercher un mois..." class="search-input">
              <div class="search-clear" v-if="searchQuery" @click="searchQuery = ''">✕</div>
            </div>
          </div>

          <div class="monthly-grid">
            <div 
              v-for="(data, index) in filteredMonthlyData" 
              :key="index"
              class="monthly-card"
              :class="{ 'positive-month': data.resultatNet > 0, 'negative-month': data.resultatNet < 0 }"
            >
              <div class="monthly-header">
                <div class="month-badge">{{ formatDate(data.mois) }}</div>
                <div class="result-indicator" :class="{ 'positive': data.resultatNet > 0, 'negative': data.resultatNet < 0 }">
                  {{ data.resultatNet > 0 ? '📈' : '📉' }}
                </div>
              </div>

              <div class="monthly-details">
                <div class="detail-row">
                  <span class="detail-label">Chiffre d'affaires:</span>
                  <span class="detail-value revenue">{{ formatCurrency(data.chiffreAffaires) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Charges:</span>
                  <span class="detail-value expenses">{{ formatCurrency(data.charges) }}</span>
                </div>
                <div class="detail-divider"></div>
                <div class="detail-row final-result">
                  <span class="detail-label">Résultat net:</span>
                  <span class="detail-value result" :class="{ 'positive': data.resultatNet > 0, 'negative': data.resultatNet < 0 }">
                    {{ formatCurrency(data.resultatNet) }}
                  </span>
                </div>
              </div>

              <div class="monthly-footer">
                <div class="margin-info">
                  <span class="margin-label">Marge:</span>
                  <span class="margin-badge" :class="getMarginClass(data)">
                    {{ formatMargin(data) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Résumé annuel -->
          <div class="yearly-summary">
            <div class="summary-card">
              <h3>Résumé {{ selectedYear }}</h3>
              <div class="summary-content">
                <div class="summary-item">
                  <span class="summary-label">Total CA:</span>
                  <span class="summary-value revenue">{{ formatCurrency(totals.chiffreAffaires) }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Total Charges:</span>
                  <span class="summary-value expenses">{{ formatCurrency(totals.charges) }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Résultat Net:</span>
                  <span class="summary-value result" :class="{ 'positive': totals.resultatNet > 0, 'negative': totals.resultatNet < 0 }">
                    {{ formatCurrency(totals.resultatNet) }}
                  </span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Marge Nette:</span>
                  <span class="summary-value margin">{{ calculateMargin() }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state pour la recherche -->
          <div v-if="filteredMonthlyData.length === 0 && searchQuery" class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>Aucun mois trouvé</h3>
            <p>Essayez de modifier votre recherche</p>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'
import axios from 'axios'

export default {
  name: 'FinancialDashboard',
  data() {
  return {
    selectedYear: null,
    chart: null,
    financialData: [],
    availableYears: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    showExportMenu: false,
    debugMode: false,
    chartType: 'line' // Type de graphique par défaut
  }
},

  computed: {
    filteredData() {
      console.log('🔍 Filtrage des données...');
      console.log('Année sélectionnée:', this.selectedYear);
      console.log('Données totales:', this.financialData.length);
      
      if (!this.financialData || this.financialData.length === 0) {
        console.log('❌ Aucune donnée à filtrer');
        return [];
      }
      
      if (!this.selectedYear) {
        console.log('❌ Aucune année sélectionnée');
        return [];
      }
      
      const filtered = this.financialData.filter(item => {
        // Support des deux formats de date
        let itemYear;
        if (item.mois.includes('-')) {
          // Format YYYY-MM
          itemYear = parseInt(item.mois.substring(0, 4));
        } else {
          // Autre format
          itemYear = new Date(item.mois).getFullYear();
        }
        
        const match = itemYear === parseInt(this.selectedYear);
        console.log(`Mois ${item.mois} (année ${itemYear}) vs ${this.selectedYear}: ${match ? '✅' : '❌'}`);
        return match;
      });
      
      console.log('✅ Données filtrées:', filtered.length);
      return filtered;
    },
    filteredMonthlyData() {
      let filtered = this.filteredData;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(item => 
          this.formatDate(item.mois).toLowerCase().includes(query)
        );
      }
      return filtered;
    },
    totals() {
      return this.filteredData.reduce((acc, curr) => {
        acc.chiffreAffaires += curr.chiffreAffaires || 0;
        acc.charges += curr.charges || 0;
        acc.resultatNet += curr.resultatNet || 0;
        return acc;
      }, { chiffreAffaires: 0, charges: 0, resultatNet: 0 });
    }
  },
  methods: {
    
    formatCurrency(value) {
      if (typeof value !== 'number' || isNaN(value)) return '0,00 €';
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(value);
    },
    formatDate(dateString) {
      try {
        // Support du format YYYY-MM
        if (dateString.match(/^\d{4}-\d{2}$/)) {
          const [year, month] = dateString.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          return date.toLocaleDateString('fr-FR', { 
            month: 'long'
          });
        }
        // Format standard
        return new Date(dateString).toLocaleDateString('fr-FR', { 
          month: 'long'
        });
      } catch (error) {
        console.error('Erreur format date:', dateString, error);
        return dateString;
      }
    },
    calculateMargin() {
      if (this.totals.chiffreAffaires === 0) return 0;
      return ((this.totals.resultatNet / this.totals.chiffreAffaires) * 100).toFixed(1);
    },
    formatMargin(data) {
      if (!data.chiffreAffaires || data.chiffreAffaires === 0) return 0;
      return ((data.resultatNet / data.chiffreAffaires) * 100).toFixed(1);
    },
    getMarginClass(data) {
      const margin = this.formatMargin(data);
      if (margin > 20) return 'excellent';
      if (margin > 10) return 'good';
      if (margin > 0) return 'average';
      return 'poor';
    },
    refreshData() {
      this.fetchData();
    },
    toggleExportMenu() {
      this.showExportMenu = !this.showExportMenu;
    },
    // NOUVELLE MÉTHODE: Changer le type de graphique avec délai
    changeChartType(type) {
      console.log('🔄 Changement de type de graphique:', this.chartType, '→', type);
      this.chartType = type;
      
      // Forcer la destruction complète avant de recréer
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      
      // Délai pour s'assurer que la destruction est complète
      setTimeout(() => {
        this.createChart();
      }, 100);
    },
    exportData(format) {
      this.showExportMenu = false;
      
      const fileName = `tableau-bord-financier-${this.selectedYear}`;
      const exportData = {
        summary: {
          year: this.selectedYear,
          totalRevenue: this.totals.chiffreAffaires,
          totalExpenses: this.totals.charges,
          netResult: this.totals.resultatNet,
          margin: this.calculateMargin()
        },
        monthlyData: this.filteredData.map(item => ({
          month: this.formatDate(item.mois),
          revenue: item.chiffreAffaires,
          expenses: item.charges,
          netResult: item.resultatNet,
          margin: this.formatMargin(item)
        }))
      };

      switch(format) {
        case 'excel':
          this.exportToExcel(exportData, fileName);
          break;
        case 'csv':
          this.exportToCSV(exportData, fileName);
          break;
        case 'pdf':
          this.exportToPDF(exportData, fileName);
          break;
        case 'json':
          this.exportToJSON(exportData, fileName);
          break;
        default:
          console.log('Format non supporté');
      }
    },
    exportToExcel(data, fileName) {
      // Création des données pour Excel
      const worksheet = [
        ['Tableau de Bord Financier', '', '', '', ''],
        ['Année:', data.summary.year, '', '', ''],
        ['', '', '', '', ''],
        ['RÉSUMÉ ANNUEL', '', '', '', ''],
        ['Chiffre d\'affaires total:', this.formatCurrency(data.summary.totalRevenue), '', '', ''],
        ['Charges totales:', this.formatCurrency(data.summary.totalExpenses), '', '', ''],
        ['Résultat net:', this.formatCurrency(data.summary.netResult), '', '', ''],
        ['Marge nette:', data.summary.margin + '%', '', '', ''],
        ['', '', '', '', ''],
        ['DÉTAIL MENSUEL', '', '', '', ''],
        ['Mois', 'Chiffre d\'affaires', 'Charges', 'Résultat net', 'Marge (%)'],
        ...data.monthlyData.map(item => [
          item.month,
          this.formatCurrency(item.revenue),
          this.formatCurrency(item.expenses),
          this.formatCurrency(item.netResult),
          item.margin + '%'
        ])
      ];

      // Conversion en CSV pour Excel
      const csvContent = worksheet.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');
      
      this.downloadFile(csvContent, `${fileName}.csv`, 'text/csv;charset=utf-8;');
    },
    exportToCSV(data, fileName) {
      const csvHeader = 'Mois,Chiffre d\'affaires,Charges,Résultat net,Marge (%)\n';
      const csvContent = csvHeader + data.monthlyData.map(item => 
        `"${item.month}","${item.revenue}","${item.expenses}","${item.netResult}","${item.margin}%"`
      ).join('\n');
      
      this.downloadFile(csvContent, `${fileName}.csv`, 'text/csv;charset=utf-8;');
    },
    exportToPDF(data, fileName) {
      // Création d'un contenu HTML pour PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Tableau de Bord Financier ${data.summary.year}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { margin-bottom: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
            .summary-item { display: flex; justify-content: space-between; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #667eea; color: white; }
            .positive { color: #10b981; }
            .negative { color: #ef4444; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Tableau de Bord Financier</h1>
            <h2>Année ${data.summary.year}</h2>
          </div>
          
          <div class="summary">
            <h3>Résumé Annuel</h3>
            <div class="summary-item">
              <span>Chiffre d'affaires total:</span>
              <strong>${this.formatCurrency(data.summary.totalRevenue)}</strong>
            </div>
            <div class="summary-item">
              <span>Charges totales:</span>
              <strong>${this.formatCurrency(data.summary.totalExpenses)}</strong>
            </div>
            <div class="summary-item">
              <span>Résultat net:</span>
              <strong class="${data.summary.netResult >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(data.summary.netResult)}</strong>
            </div>
            <div class="summary-item">
              <span>Marge nette:</span>
              <strong>${data.summary.margin}%</strong>
            </div>
          </div>

          <h3>Détail Mensuel</h3>
          <table>
            <thead>
              <tr>
                <th>Mois</th>
                <th>Chiffre d'affaires</th>
                <th>Charges</th>
                <th>Résultat net</th>
                <th>Marge (%)</th>
              </tr>
            </thead>
            <tbody>
              ${data.monthlyData.map(item => `
                <tr>
                  <td>${item.month}</td>
                  <td>${this.formatCurrency(item.revenue)}</td>
                  <td>${this.formatCurrency(item.expenses)}</td>
                  <td class="${item.netResult >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(item.netResult)}</td>
                  <td>${item.margin}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      
      // Ouvrir dans une nouvelle fenêtre pour impression en PDF
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    },
    exportToJSON(data, fileName) {
      const jsonContent = JSON.stringify({
        exportDate: new Date().toISOString(),
        ...data
      }, null, 2);
      
      this.downloadFile(jsonContent, `${fileName}.json`, 'application/json;charset=utf-8;');
    },
    downloadFile(content, fileName, mimeType) {
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    // Remplacez votre méthode fetchData() par cette version debug avancée
async fetchData() {
  console.log('🚀 Début du chargement des données...');
  this.isLoading = true;
  this.error = null;
  
  try {
    const token = sessionStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    console.log('🔑 Token trouvé, récupération des comptes...');
    
    const accountsRes = await axios.get('/api/v1/models/C_ElementValue', {
      params: {
        'fields': 'C_ElementValue_ID,Value,Name,AccountType'
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Comptes récupérés:', accountsRes.data.records?.length);
    
    // CORRECTION MAJEURE - Gérer AccountType comme objet ET classification automatique
    // Remplacez cette section dans votre fetchData() :

// CORRECTION MAJEURE - Classification basée sur les numéros de comptes français
const accountTypeMap = {};
const typeCount = { R: 0, E: 0, A: 0, L: 0, other: 0 };

// Fonction de classification automatique basée sur le plan comptable français
const getCorrectAccountType = (account) => {
  const accountNumber = account.Value;
  
  // Classification française par classe de comptes
  if (accountNumber.startsWith('1') || accountNumber.startsWith('2') || accountNumber.startsWith('3')) {
    return 'A'; // Actif (Assets) - Comptes de bilan
  }
  if (accountNumber.startsWith('4')) {
    return 'L'; // Passif (Liability) - Comptes de tiers
  }
  if (accountNumber.startsWith('5')) {
    return 'A'; // Actif (Assets) - Comptes financiers
  }
  if (accountNumber.startsWith('6')) {
    return 'E'; // Charges (Expense)
  }
  if (accountNumber.startsWith('7')) {
    return 'R'; // Produits (Revenue)
  }
  
  // Fallback sur le type configuré dans iDempiere (même s'il semble incorrect)
  return account.AccountType?.id || account.AccountType || 'A';
};

accountsRes.data.records.forEach(ev => {
  // Récupérer le type original (même s'il est incorrect)
  const originalType = ev.AccountType?.id || ev.AccountType;
  
  // Appliquer la classification automatique correcte
  const correctedType = getCorrectAccountType(ev);
  
  // Utiliser l'ID correct de l'API
  const accountId = ev.id; // API retourne directement "id"
  
  accountTypeMap[accountId] = correctedType;
  
  if (correctedType === 'R') typeCount.R++;
  else if (correctedType === 'E') typeCount.E++;
  else if (correctedType === 'A') typeCount.A++;
  else if (correctedType === 'L') typeCount.L++;
  else typeCount.other++;
  
  // Debug détaillé pour voir les classifications
  console.log(`📊 Compte ${ev.Value} "${ev.Name}": ${originalType} → ${correctedType} [ID: ${accountId}]`);
});

console.log('📈 Types de comptes après classification automatique:', typeCount);
console.log('🗺️ Mapping des comptes (AUTO-CLASSIFIÉ):', accountTypeMap);

console.log('📈 Types de comptes après correction:', typeCount);
console.log('🗺️ Mapping des comptes (CORRIGÉ):', accountTypeMap);

    // Récupérer toutes les données d'abord pour déterminer les années disponibles
    console.log('📈 Récupération des écritures comptables...');
    
    // CORRECTION: Essayer d'abord Fact_Acct, puis GL_JournalLine en fallback
    let factRes;
    try {
      factRes = await axios.get('/api/v1/models/Fact_Acct', {
        params: {
          '$filter': `AD_Client_ID eq 11 and AD_Org_ID eq 11 and PostingType eq 'A'`
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (factError) {
      console.log('⚠️ Erreur avec Fact_Acct, fallback vers GL_JournalLine');
      factRes = { data: { records: [] } };
    }
    
    let factAcctData = factRes.data.records || [];
    console.log('💾 Écritures Fact_Acct récupérées:', factAcctData?.length);
    
    // Si pas d'écritures dans Fact_Acct, essayer GL_JournalLine
    if (!factAcctData || factAcctData.length === 0) {
      console.log('🔄 Aucune écriture dans Fact_Acct, récupération depuis GL_JournalLine...');
      
      try {
        const journalLineRes = await axios.get('/api/v1/models/GL_JournalLine', {
          params: {
            '$expand': 'GL_Journal_ID,Account_ID'
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const journalLines = journalLineRes.data.records || [];
        console.log('💾 Lignes de journal récupérées:', journalLines?.length);
        
        // Convertir les lignes de journal au format Fact_Acct
        factAcctData = journalLines.map(line => ({
          id: line.id,
          Account_ID: line.Account_ID,
          AmtAcctCr: line.AmtSourceCr || 0,
          AmtAcctDr: line.AmtSourceDr || 0,
          DateAcct: line.DateAcct,
          PostingType: 'A', // Mode actual
          AD_Client_ID: { id: 11 },
          AD_Org_ID: { id: 11 }
        }));
        
        console.log('✅ Conversion des lignes de journal terminée:', factAcctData.length, 'écritures');
        
      } catch (journalError) {
        console.error('❌ Erreur lors de la récupération des lignes de journal:', journalError);
        factAcctData = [];
      }
    }
    console.log('💾 Écritures récupérées:', factAcctData?.length);
    
    // DEBUG AVANCÉ - Analyser les écritures
    if (factAcctData && factAcctData.length > 0) {
      console.log('🔍 Échantillon d\'écritures:', factAcctData.slice(0, 3));
      
      // Analyser les montants
      const amountAnalysis = {
        withAmtAcctCr: 0,
        withAmtAcctDr: 0,
        totalCr: 0,
        totalDr: 0,
        accountsUsed: new Set(),
        monthsFound: new Set()
      };
      
      factAcctData.forEach(line => {
        if (line.AmtAcctCr && line.AmtAcctCr !== 0) {
          amountAnalysis.withAmtAcctCr++;
          amountAnalysis.totalCr += line.AmtAcctCr;
        }
        if (line.AmtAcctDr && line.AmtAcctDr !== 0) {
          amountAnalysis.withAmtAcctDr++;
          amountAnalysis.totalDr += line.AmtAcctDr;
        }
        
        const accountId = line.Account_ID?.id || line.Account_ID;
        amountAnalysis.accountsUsed.add(accountId);
        amountAnalysis.monthsFound.add(line.DateAcct.substring(0, 7));
      });
      
      console.log('💰 Analyse des montants:', {
        lignesAvecCredit: amountAnalysis.withAmtAcctCr,
        lignesAvecDebit: amountAnalysis.withAmtAcctDr,
        totalCredit: amountAnalysis.totalCr,
        totalDebit: amountAnalysis.totalDr,
        comptesUtilises: amountAnalysis.accountsUsed.size,
        moisTrouves: Array.from(amountAnalysis.monthsFound).sort()
      });
    }

    // Extraire les années disponibles
    const yearsSet = new Set();
    factAcctData.forEach(line => {
      const year = line.DateAcct.substring(0, 4);
      yearsSet.add(year);
    });
    
    this.availableYears = Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
    console.log('📅 Années disponibles:', this.availableYears);

    // Sélectionner automatiquement l'année la plus récente si aucune n'est sélectionnée
    if (!this.selectedYear && this.availableYears.length > 0) {
      this.selectedYear = parseInt(this.availableYears[0]);
      console.log('🎯 Année auto-sélectionnée:', this.selectedYear);
    }

    // Filtrer par année sélectionnée
    if (this.selectedYear) {
      const yearStart = `${this.selectedYear}-01-01`;
      const yearEnd = `${this.selectedYear}-12-31`;
      
      const filteredFactData = factAcctData.filter(line => {
        return line.DateAcct >= yearStart && line.DateAcct <= yearEnd;
      });
      
      console.log(`📊 Écritures pour ${this.selectedYear}:`, filteredFactData.length);

      const monthlySummary = {};
      const debugSummary = {
        revenueLines: 0,
        expenseLines: 0,
        unknownTypeLines: 0,
        linesWithoutAmount: 0,
        totalRevenueAmount: 0,
        totalExpenseAmount: 0,
        accountMatches: 0,
        accountMismatches: 0
      };
      
      filteredFactData.forEach(line => {
        const month = line.DateAcct.substring(0, 7); // Format YYYY-MM
        const accountId = line.Account_ID?.id || line.Account_ID;
        const type = accountTypeMap[accountId];
        
        // CORRECTION : Debug amélioré pour voir les correspondances
        if (!type) {
          debugSummary.unknownTypeLines++;
          debugSummary.accountMismatches++;
          console.log('⚠️ Compte sans type:', { 
            accountId, 
            lineAccount: line.Account_ID,
            availableKeys: Object.keys(accountTypeMap).slice(0, 5)
          });
        } else {
          debugSummary.accountMatches++;
          console.log(`✅ Match trouvé - Compte ${accountId}: Type = ${type}`);
        }
        
        if (!line.AmtAcctCr && !line.AmtAcctDr) {
          debugSummary.linesWithoutAmount++;
        }
        
        if (!monthlySummary[month]) {
          monthlySummary[month] = { 
            chiffre_affaires: 0, 
            charges: 0,
            debug: {
              revenueEntries: [],
              expenseEntries: []
            }
          };
        }
        
        // Type 'R' = Revenue (Chiffre d'affaires)
        if (type === 'R') {
          debugSummary.revenueLines++;
          const amount = line.AmtAcctCr || 0;
          debugSummary.totalRevenueAmount += amount;
          monthlySummary[month].chiffre_affaires += amount;
          monthlySummary[month].debug.revenueEntries.push({
            accountId,
            amount: amount,
            line: line
          });
          console.log(`💰 REVENUE ajouté: ${amount} pour compte ${accountId}`);
        }
        
        // Type 'E' = Expense (Charges)
        else if (type === 'E') {
          debugSummary.expenseLines++;
          const amount = line.AmtAcctDr || 0;
          debugSummary.totalExpenseAmount += amount;
          monthlySummary[month].charges += amount;
          monthlySummary[month].debug.expenseEntries.push({
            accountId,
            amount: amount,
            line: line
          });
          console.log(`💸 EXPENSE ajouté: ${amount} pour compte ${accountId}`);
        }
        
        else {
          console.log(`ℹ️ Ligne ignorée (type ${type}): compte ${accountId}`);
        }
      });
      
      console.log('🔍 Résumé du processing (CORRIGÉ):', debugSummary);
      console.log('📊 Résumé mensuel brut:', monthlySummary);

      // Transformer en format attendu par le composant
      this.financialData = Object.entries(monthlySummary).map(([mois, vals]) => ({
        mois, // Format YYYY-MM
        chiffreAffaires: vals.chiffre_affaires || 0,
        charges: vals.charges || 0,
        resultatNet: (vals.chiffre_affaires || 0) - (vals.charges || 0),
        debug: vals.debug // Ajouter les infos de debug
      })).sort((a, b) => a.mois.localeCompare(b.mois));

      console.log('✅ Données formatées finales (CORRIGÉ):', this.financialData);
      
      // Afficher le détail pour le mois actuel
      if (this.financialData.length > 0) {
        const currentMonth = this.financialData[this.financialData.length - 1];
        console.log('🔍 Détail du mois', currentMonth.mois, ':', {
          revenue: currentMonth.debug.revenueEntries,
          expenses: currentMonth.debug.expenseEntries
        });
      }
      
    } else {
      console.log('⚠️ Aucune année sélectionnée');
      this.financialData = [];
    }

  } catch (error) {
    console.error('❌ Erreur lors du chargement des données:', error);
    this.error = error.response?.data?.message || error.message || 'Erreur lors du chargement des données';
    this.financialData = [];
  } finally {
    this.isLoading = false;
    console.log('🏁 Chargement terminé');
  }
},
    // MÉTHODE SÉCURISÉE: Créer le graphique avec désactivation des animations pour les barres
    createChart() {
      console.log('📊 Création du graphique - Type:', this.chartType);
      
      if (!this.$refs.chartCanvas) {
        console.warn('Canvas non trouvé, graphique non créé')
        return
      }

      // Destruction complète et reset du canvas
      if (this.chart) {
        console.log('🗑️ Destruction du graphique précédent');
        this.chart.destroy()
        this.chart = null
      }

      // Reset du canvas
      const canvas = this.$refs.chartCanvas;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!this.filteredData || this.filteredData.length === 0) {
        console.warn('Pas de données à afficher dans le graphique')
        return
      }

      const labels = this.filteredData.map(item => this.formatDate(item.mois));
      const revenueData = this.filteredData.map(item => item.chiffreAffaires);
      const expenseData = this.filteredData.map(item => item.charges);
      const netResultData = this.filteredData.map(item => item.resultatNet);

      let chartConfig;

      if (this.chartType === 'line') {
        // Configuration pour graphique en ligne (avec animations)
        chartConfig = {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Chiffre d\'affaires',
                data: revenueData,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#10B981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
              },
              {
                label: 'Charges',
                data: expenseData,
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#EF4444',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
              },
              {
                label: 'Résultat net',
                data: netResultData,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 750,
              easing: 'easeInOutQuart'
            },
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  padding: 20,
                  font: { size: 14 }
                }
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#374151',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                  label: (context) => `${context.dataset.label}: ${this.formatCurrency(context.parsed.y)}`
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { size: 12 } }
              },
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: {
                  callback: (value) => this.formatCurrency(value),
                  font: { size: 12 }
                }
              }
            }
          }
        };
      } else {
        // Configuration pour graphique en barres (SANS animations pour éviter les erreurs)
        chartConfig = {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Chiffre d\'affaires',
                data: revenueData,
                backgroundColor: '#10B981',
                borderColor: '#10B981',
                borderWidth: 1
              },
              {
                label: 'Charges',
                data: expenseData,
                backgroundColor: '#EF4444',
                borderColor: '#EF4444',
                borderWidth: 1
              },
              {
                label: 'Résultat net',
                data: netResultData,
                backgroundColor: '#667eea',
                borderColor: '#667eea',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            // DÉSACTIVER TOUTES LES ANIMATIONS pour éviter l'erreur
            animation: false,
            animations: false,
            transitions: {
              active: {
                animation: {
                  duration: 0
                }
              }
            },
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 20,
                  font: { size: 14 }
                }
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#374151',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                animation: false, // Désactiver même les animations des tooltips
                callbacks: {
                  label: (context) => `${context.dataset.label}: ${this.formatCurrency(context.parsed.y)}`
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { size: 12 } }
              },
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: {
                  callback: (value) => this.formatCurrency(value),
                  font: { size: 12 }
                }
              }
            }
          }
        };
      }

      // Créer le graphique avec protection d'erreur renforcée
      try {
        console.log('🚀 Tentative de création du graphique...');
        this.chart = new Chart(ctx, chartConfig);
        console.log('✅ Graphique créé avec succès - Type:', this.chartType);
        
        // Protection supplémentaire: vérifier que le graphique est bien créé
        if (!this.chart) {
          throw new Error('Le graphique n\'a pas pu être créé');
        }
        
      } catch (error) {
        console.error('❌ Erreur lors de la création du graphique:', error);
        this.chart = null;
        
        // Message d'erreur à l'utilisateur pour les barres
        if (this.chartType === 'bar') {
          console.log('⚠️ Problème avec le graphique en barres, basculement vers ligne...');
          // Forcer le retour au graphique en ligne
          setTimeout(() => {
            this.chartType = 'line';
            this.createChart();
          }, 500);
        }
      }
    }
  },
  watch: {
    selectedYear: {
      handler(newYear, oldYear) {
        console.log(`🔄 Changement d'année: ${oldYear} → ${newYear}`);
        if (newYear && newYear !== oldYear) {
          this.fetchData();
        }
      }
    },
    filteredData: {
      handler(newData) {
        console.log('📊 Données filtrées mises à jour:', newData.length, 'éléments');
        this.$nextTick(() => {
          this.createChart();
        });
      },
      deep: true
    },
    // NOUVEAU WATCH: Recréer le graphique quand le type change
    chartType: {
      handler(newType, oldType) {
        console.log(`📈 Changement de type de graphique: ${oldType} → ${newType}`);
        if (this.filteredData && this.filteredData.length > 0) {
          this.$nextTick(() => {
            this.createChart();
          });
        }
      }
    }
  },
  async mounted() {
    console.log('🎬 Montage du composant FinancialDashboard');
    await this.fetchData();
    this.$nextTick(() => {
      this.createChart();
    });
    
    // Fermer le menu d'export en cliquant ailleurs
    document.addEventListener('click', (event) => {
      if (this.$refs.exportDropdown && !this.$refs.exportDropdown.contains(event.target)) {
        this.showExportMenu = false;
      }
    });
  },
  beforeUnmount() {
    // Nettoyer les event listeners
    document.removeEventListener('click', this.handleClickOutside);
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Debug Panel */
.debug-panel {
  font-family: 'Courier New', monospace;
  z-index: 1000;
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

.header-controls {
  display: flex;
  align-items: flex-end;
  gap: 2rem;
}

.year-filter {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.filter-label {
  font-size: 0.875rem;
  opacity: 0.9;
  font-weight: 500;
}

.select-wrapper {
  position: relative;
}

.year-select {
  appearance: none;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  font-size: 1rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  backdrop-filter: blur(10px);
}

.year-select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.25);
}

.year-select option {
  background: #667eea;
  color: white;
}

.select-wrapper::after {
  content: '▼';
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  pointer-events: none;
  font-size: 0.75rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  position: relative;
}

.export-dropdown {
  position: relative;
}

.btn-export {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  position: relative;
}

.btn-export:hover {
  background: white;
  transform: translateY(-1px);
}

.dropdown-arrow {
  margin-left: 0.5rem;
  font-size: 0.75rem;
  transition: transform 0.2s ease;
}

.export-dropdown.active .dropdown-arrow {
  transform: rotate(180deg);
}

.export-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  z-index: 1000;
  min-width: 200px;
  overflow: hidden;
  animation: fadeInDown 0.2s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.export-option {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.export-option:hover {
  background: #f8fafc;
  color: #667eea;
}

.export-option:active {
  background: #e2e8f0;
}

.export-icon {
  font-size: 1rem;
  width: 1.25rem;
  text-align: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
}

.btn-refresh {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-refresh:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.btn-debug {
  background: rgba(255, 193, 7, 0.2);
  color: white;
  border: 2px solid rgba(255, 193, 7, 0.3);
}

.btn-debug:hover,
.btn-debug.active {
  background: rgba(255, 193, 7, 0.3);
  border-color: rgba(255, 193, 7, 0.5);
}

.btn-export {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
}

.btn-export:hover {
  background: white;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 1rem;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  top: -1rem;
}

/* Loading and Error States */
.loading-state, .error-state, .empty-data-state {
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

.error-icon, .empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.error-state h3, .loading-state h3, .empty-data-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #374151;
}

.error-state p, .loading-state p, .empty-data-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.retry-btn, .debug-btn {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 0.5rem;
}

.retry-btn:hover, .debug-btn:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.debug-btn {
  background: #ffc107;
  color: #000;
}

.debug-btn:hover {
  background: #e0a800;
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* KPI Section */
.kpi-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.kpi-card::before {
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

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.kpi-card:hover::before {
  transform: scaleX(1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.kpi-icon {
  width: 50px;
  height: 50px;
  background: #f8fafc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
}

.kpi-trend.positive {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.kpi-trend.negative {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.trend-indicator {
  font-size: 1rem;
}

.kpi-content h3 {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin: 0 0 0.5rem 0;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.kpi-value.positive {
  color: #10b981;
}

.kpi-value.negative {
  color: #ef4444;
}

.kpi-description {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

/* Chart Section */
.chart-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.section-title h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.section-subtitle {
  color: #475569;
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
  background: #f8fafc;
  border-radius: 12px;
  padding: 0.25rem;
}

.chart-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.chart-btn.active,
.chart-btn:hover {
  background: white;
  color: #1e293b;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.chart-container {
  height: 400px;
  position: relative;
}

/* Monthly Section */
.monthly-section {
  margin-bottom: 2rem;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 300px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #64748b;
  font-size: 1rem;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  font-size: 0.875rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  transition: all 0.3s ease;
  outline: none;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-clear {
  position: absolute;
  right: 1rem;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.search-clear:hover {
  background: #f1f5f9;
  color: #475569;
}

.monthly-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.monthly-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.monthly-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.monthly-card.positive-month::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.monthly-card.negative-month::before {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.monthly-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.monthly-card:hover::before {
  transform: scaleX(1);
}

.monthly-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.month-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: capitalize;
}

.result-indicator {
  font-size: 1.5rem;
}

.result-indicator.positive {
  filter: hue-rotate(120deg);
}

.result-indicator.negative {
  filter: hue-rotate(-60deg);
}

.monthly-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.detail-label {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

.detail-value {
  font-weight: 600;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9rem;
}

.detail-value.revenue {
  color: #10b981;
}

.detail-value.expenses {
  color: #ef4444;
}

.detail-value.result.positive {
  color: #10b981;
}

.detail-value.result.negative {
  color: #ef4444;
}

.detail-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 1rem 0;
}

.final-result {
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 0 !important;
}

.final-result .detail-label {
  font-weight: 600;
  color: #374151;
}

.monthly-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.margin-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.margin-label {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.margin-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.75rem;
  text-align: center;
}

.margin-badge.excellent {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.margin-badge.good {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.margin-badge.average {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.margin-badge.poor {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Yearly Summary */
.yearly-summary {
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.summary-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
}

.summary-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-label {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  font-family: 'Monaco', 'Consolas', monospace;
}

.summary-value.revenue {
  color: #10b981;
}

.summary-value.expenses {
  color: #ef4444;
}

.summary-value.result.positive {
  color: #10b981;
}

.summary-value.result.negative {
  color: #ef4444;
}

.summary-value.margin {
  color: #667eea;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  margin-top: 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: #1e293b;
  font-weight: 600;
}

.empty-state p {
  color: #475569;
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .header-controls {
    align-items: center;
    width: 100%;
  }
  
  .year-filter {
    align-items: center;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .search-container {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .kpi-section {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .monthly-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .monthly-card {
    padding: 1.25rem;
  }
  
  .header-content {
    padding: 0 1rem;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: center;
  }
  
  .btn {
    flex: 1;
  }
  
  .chart-container {
    height: 300px;
  }
  
  .summary-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .kpi-card {
    padding: 1.25rem;
  }
  
  .kpi-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }
  
  .kpi-value {
    font-size: 1.5rem;
  }
  
  .monthly-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .result-indicator {
    align-self: flex-end;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Animations */
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

.kpi-card,
.monthly-card,
.chart-section,
.summary-card {
  animation: fadeInUp 0.6s ease-out;
}

/* Utilities */
.positive {
  color: #10b981 !important;
}

.negative {
  color: #ef4444 !important;
}
</style>