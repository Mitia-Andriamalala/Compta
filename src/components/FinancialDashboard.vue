<template>
  <div class="financial-dashboard">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">
          <span class="title-icon">📊</span>
          Tableau de Bord Financier
        </h1>
        <div class="header-controls">
          <!-- Year Selector -->
          <div class="year-selector">
            <label for="year-select" class="year-label">Année :</label>
            <select 
              id="year-select" 
              v-model="selectedYear" 
              class="year-select"
              :disabled="isLoading"
            >
              <option value="" disabled>Sélectionner une année</option>
              <option 
                v-for="year in availableYears" 
                :key="year" 
                :value="parseInt(year)"
              >
                {{ year }}
              </option>
            </select>
          </div>
          
          <!-- Actions -->
          <div class="header-actions">
            <button 
              @click="refreshData" 
              class="btn btn-refresh"
              :disabled="isLoading"
            >
              <span class="btn-icon">🔄</span>
              {{ isLoading ? 'Chargement...' : 'Actualiser' }}
            </button>
            
            <!-- Export Dropdown -->
            <div class="export-dropdown" ref="exportDropdown">
              <button 
                @click="toggleExportMenu" 
                class="btn btn-export"
                :disabled="!filteredData.length"
              >
                <span class="btn-icon">📤</span>
                Exporter
                <span class="dropdown-arrow">▼</span>
              </button>
              
              <div v-if="showExportMenu" class="dropdown-menu">
                <button @click="exportData('csv')" class="dropdown-item">
                  <span class="dropdown-icon">📄</span>
                  Exporter en CSV
                </button>
                <button @click="exportData('excel')" class="dropdown-item">
                  <span class="dropdown-icon">📊</span>
                  Exporter en Excel
                </button>
                <button @click="exportData('pdf')" class="dropdown-item">
                  <span class="dropdown-icon">📑</span>
                  Exporter en PDF
                </button>
                <button @click="exportData('json')" class="dropdown-item">
                  <span class="dropdown-icon">🔧</span>
                  Exporter en JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">Chargement des données financières...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3 class="error-title">Erreur de chargement</h3>
      <p class="error-message">{{ error }}</p>
      <button @click="refreshData" class="btn btn-retry">
        <span class="btn-icon">🔄</span>
        Réessayer
      </button>
    </div>

    <!-- Main Content -->
    <div v-else-if="selectedYear && filteredData.length > 0" class="dashboard-content">
      
      <!-- KPI Cards Section -->
      <div class="kpi-section">
        <!-- KPI Chiffre d'affaires -->
        <div class="kpi-card revenue" @click="navigateToDetail('revenue')" style="cursor: pointer;">
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
            <div class="click-indicator">
              <span class="click-icon">👆</span>
              Cliquez pour voir le détail
            </div>
          </div>
        </div>

        <!-- KPI Charges -->
        <div class="kpi-card expenses" @click="navigateToDetail('expense')" style="cursor: pointer;">
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
            <div class="click-indicator">
              <span class="click-icon">👆</span>
              Cliquez pour voir le détail
            </div>
          </div>
        </div>

        <!-- KPI Résultat Net -->
        <div class="kpi-card profit" :class="{ 'positive-result': totals.resultatNet > 0, 'negative-result': totals.resultatNet < 0 }" @click="navigateToDetail('profit')" style="cursor: pointer;">
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
            <div class="click-indicator">
              <span class="click-icon">👆</span>
              Cliquez pour voir le détail
            </div>
          </div>
        </div>

        <!-- KPI Marge -->
        <div class="kpi-card margin" @click="navigateToDetail('margin')" style="cursor: pointer;">
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
            <div class="click-indicator">
              <span class="click-icon">👆</span>
              Cliquez pour voir le détail
            </div>
          </div>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="chart-section">
        <div class="chart-header">
          <h2 class="chart-title">
            <span class="chart-icon">📈</span>
            Évolution financière {{ selectedYear }}
          </h2>
          <div class="chart-controls">
            <button 
              @click="changeChartType('line')" 
              :class="['chart-type-btn', { active: chartType === 'line' }]"
            >
              📈 Courbes
            </button>
            <button 
              @click="changeChartType('bar')" 
              :class="['chart-type-btn', { active: chartType === 'bar' }]"
            >
              📊 Barres
            </button>
          </div>
        </div>
        
        <div class="chart-container">
          <canvas ref="chartCanvas" class="financial-chart"></canvas>
        </div>
      </div>

      <!-- Monthly Details Table -->
      <div class="table-section">
        <div class="table-header">
          <h2 class="table-title">
            <span class="table-icon">📋</span>
            Détail mensuel {{ selectedYear }}
          </h2>
          <div class="table-controls">
            <div class="search-box">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Rechercher un mois..." 
                class="search-input"
              >
              <span class="search-icon">🔍</span>
            </div>
          </div>
        </div>
        
        <div class="table-container">
          <table class="financial-table">
            <thead>
              <tr>
                <th class="month-col">Mois</th>
                <th class="amount-col">Chiffre d'affaires</th>
                <th class="amount-col">Charges</th>
                <th class="amount-col">Résultat net</th>
                <th class="margin-col">Marge (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(item, index) in filteredMonthlyData" 
                :key="index"
                class="table-row"
                :class="{ 'profit-row': item.resultatNet > 0, 'loss-row': item.resultatNet < 0 }"
              >
                <td class="month-cell">
                  <div class="month-wrapper">
                    <span class="month-name">{{ formatDate(item.mois) }}</span>
                    <span class="month-date">{{ item.mois }}</span>
                  </div>
                </td>
                <td class="amount-cell revenue">
                  <span class="amount-value">{{ formatCurrency(item.chiffreAffaires) }}</span>
                </td>
                <td class="amount-cell expense">
                  <span class="amount-value">{{ formatCurrency(item.charges) }}</span>
                </td>
                <td class="amount-cell result" :class="{ 'positive': item.resultatNet > 0, 'negative': item.resultatNet < 0 }">
                  <span class="amount-value">{{ formatCurrency(item.resultatNet) }}</span>
                </td>
                <td class="margin-cell">
                  <div class="margin-wrapper" :class="getMarginClass(item)">
                    <span class="margin-value">{{ formatMargin(item) }}%</span>
                    <div class="margin-bar">
                      <div 
                        class="margin-fill" 
                        :style="{ width: Math.min(Math.abs(formatMargin(item)), 100) + '%' }"
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="totals-row">
                <td class="total-label">
                  <strong>TOTAL {{ selectedYear }}</strong>
                </td>
                <td class="total-amount revenue">
                  <strong>{{ formatCurrency(totals.chiffreAffaires) }}</strong>
                </td>
                <td class="total-amount expense">
                  <strong>{{ formatCurrency(totals.charges) }}</strong>
                </td>
                <td class="total-amount result" :class="{ 'positive': totals.resultatNet > 0, 'negative': totals.resultatNet < 0 }">
                  <strong>{{ formatCurrency(totals.resultatNet) }}</strong>
                </td>
                <td class="total-margin">
                  <strong class="margin-total">{{ calculateMargin() }}%</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="selectedYear && filteredData.length === 0" class="empty-state">
      <div class="empty-icon">📊</div>
      <h3 class="empty-title">Aucune donnée disponible</h3>
      <p class="empty-message">
        Aucune donnée financière trouvée pour l'année {{ selectedYear }}.
      </p>
      <button @click="refreshData" class="btn btn-reload">
        <span class="btn-icon">🔄</span>
        Recharger les données
      </button>
    </div>

    <!-- No Year Selected -->
    <div v-else class="no-year-state">
      <div class="no-year-icon">📅</div>
      <h3 class="no-year-title">Sélectionnez une année</h3>
      <p class="no-year-message">
        Veuillez sélectionner une année pour afficher les données financières.
      </p>
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
        let itemYear;
        if (item.mois.includes('-')) {
          itemYear = parseInt(item.mois.substring(0, 4));
        } else {
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
        if (dateString.match(/^\d{4}-\d{2}$/)) {
          const [year, month] = dateString.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          return date.toLocaleDateString('fr-FR', { 
            month: 'long'
          });
        }
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
    changeChartType(type) {
      console.log('🔄 Changement de type de graphique:', this.chartType, '→', type);
      this.chartType = type;
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
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
            '$filter': 'AD_Client_ID eq 11',
            'fields': 'C_ElementValue_ID,Value,Name,AccountType'
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('📊 Comptes récupérés:', accountsRes.data.records?.length);
        const accountTypeMap = {};
        const typeCount = { R: 0, E: 0, A: 0, L: 0, other: 0 };
        const getCorrectAccountType = (account) => {
          const accountNumber = account.Value;
          if (accountNumber.startsWith('1') || accountNumber.startsWith('2') || accountNumber.startsWith('3')) {
            return 'A';
          }
          if (accountNumber.startsWith('4')) {
            return 'L';
          }
          if (accountNumber.startsWith('5')) {
            return 'A';
          }
          if (accountNumber.startsWith('6')) {
            return 'E';
          }
          if (accountNumber.startsWith('7')) {
            return 'R';
          }
          return account.AccountType?.id || account.AccountType || 'A';
        };
        accountsRes.data.records.forEach(ev => {
          const originalType = ev.AccountType?.id || ev.AccountType;
          const correctedType = getCorrectAccountType(ev);
          const accountId = ev.id;
          accountTypeMap[accountId] = correctedType;
          if (correctedType === 'R') typeCount.R++;
          else if (correctedType === 'E') typeCount.E++;
          else if (correctedType === 'A') typeCount.A++;
          else if (correctedType === 'L') typeCount.L++;
          else typeCount.other++;
          console.log(`📊 Compte ${ev.Value} "${ev.Name}": ${originalType} → ${correctedType} [ID: ${accountId}]`);
        });
        console.log('📈 Types de comptes après classification automatique:', typeCount);
        console.log('🗺️ Mapping des comptes (AUTO-CLASSIFIÉ):', accountTypeMap);
        console.log('📈 Récupération des écritures comptables...');
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
            factAcctData = journalLines.map(line => ({
              id: line.id,
              Account_ID: line.Account_ID,
              AmtAcctCr: line.AmtSourceCr || 0,
              AmtAcctDr: line.AmtSourceDr || 0,
              DateAcct: line.DateAcct,
              PostingType: 'A',
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
        if (factAcctData && factAcctData.length > 0) {
          console.log('🔍 Échantillon d\'écritures:', factAcctData.slice(0, 3));
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
        const yearsSet = new Set();
        factAcctData.forEach(line => {
          const year = line.DateAcct.substring(0, 4);
          yearsSet.add(year);
        });
        this.availableYears = Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
        console.log('📅 Années disponibles:', this.availableYears);
        if (!this.selectedYear && this.availableYears.length > 0) {
          this.selectedYear = parseInt(this.availableYears[0]);
          console.log('🎯 Année auto-sélectionnée:', this.selectedYear);
        }
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
            const month = line.DateAcct.substring(0, 7);
            const accountId = line.Account_ID?.id || line.Account_ID;
            const type = accountTypeMap[accountId];
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
          this.financialData = Object.entries(monthlySummary).map(([mois, vals]) => ({
            mois,
            chiffreAffaires: vals.chiffre_affaires || 0,
            charges: vals.charges || 0,
            resultatNet: (vals.chiffre_affaires || 0) - (vals.charges || 0),
            debug: vals.debug
          })).sort((a, b) => a.mois.localeCompare(b.mois));
          console.log('✅ Données formatées finales (CORRIGÉ):', this.financialData);
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
    createChart() {
      console.log('📊 Création du graphique - Type:', this.chartType);
      if (!this.$refs.chartCanvas) {
        console.warn('Canvas non trouvé, graphique non créé');
        return;
      }
      if (this.chart) {
        console.log('🗑️ Destruction du graphique précédent');
        this.chart.destroy();
        this.chart = null;
      }
      const canvas = this.$refs.chartCanvas;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!this.filteredData || this.filteredData.length === 0) {
        console.warn('Pas de données à afficher dans le graphique');
        return;
      }
      const labels = this.filteredData.map(item => this.formatDate(item.mois));
      const revenueData = this.filteredData.map(item => item.chiffreAffaires);
      const expenseData = this.filteredData.map(item => item.charges);
      const netResultData = this.filteredData.map(item => item.resultatNet);
      let chartConfig;
      if (this.chartType === 'line') {
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
                animation: false,
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
      try {
        console.log('🚀 Tentative de création du graphique...');
        this.chart = new Chart(ctx, chartConfig);
        console.log('✅ Graphique créé avec succès - Type:', this.chartType);
        if (!this.chart) {
          throw new Error('Le graphique n\'a pas pu être créé');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la création du graphique:', error);
        this.chart = null;
        if (this.chartType === 'bar') {
          console.log('⚠️ Problème avec le graphique en barres, basculement vers ligne...');
          setTimeout(() => {
            this.chartType = 'line';
            this.createChart();
          }, 500);
        }
      }
    },
    navigateToDetail(indicator) {
      console.log(`🔍 Navigation vers détail: ${indicator}`);
      const detailData = {
        indicator: indicator,
        year: this.selectedYear,
        amount: this.getAmountForIndicator(indicator),
        rawData: this.filteredData
      };
      this.$router.push({
        name: 'FinancialDetail',
        params: {
          indicator: indicator,
          year: this.selectedYear
        },
        query: {
          amount: this.getAmountForIndicator(indicator)
        }
      });
    },
    getAmountForIndicator(indicator) {
      switch (indicator) {
        case 'revenue':
          return this.totals.chiffreAffaires;
        case 'expense':
          return this.totals.charges;
        case 'profit':
          return this.totals.resultatNet;
        case 'margin':
          return this.calculateMargin();
        default:
          return 0;
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
    document.addEventListener('click', (event) => {
      if (this.$refs.exportDropdown && !this.$refs.exportDropdown.contains(event.target)) {
        this.showExportMenu = false;
      }
    });
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
</script>

<style scoped>
/* Global Styles */
.financial-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Dashboard Header */
.dashboard-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 100; /* Z-index pour le header */
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.dashboard-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

/* Year Selector */
.year-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.year-label {
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
}

.year-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  background: white;
  color: #374151;
  transition: all 0.3s ease;
  min-width: 140px;
}

.year-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.year-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  white-space: nowrap;
}

.btn-refresh {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-refresh:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-export {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  position: relative;
}

.btn-export:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-export:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown-arrow {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.btn-export:hover .dropdown-arrow {
  transform: rotate(180deg);
}

/* Export Dropdown */
.export-dropdown {
  position: relative;
  z-index: 1001; /* S'assurer que le conteneur parent a aussi un z-index élevé */
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 9999; /* Z-index très élevé pour passer au-dessus de tout */
  overflow: hidden;
  animation: slideDown 0.3s ease;
  backdrop-filter: blur(10px); /* Effet de flou pour le background */
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  border: none;
  background: none;
  color: #374151;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: #f3f4f6;
  color: #667eea;
}

.dropdown-icon {
  font-size: 1.1rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #6b7280;
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-title {
  color: #dc2626;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.error-message {
  color: #6b7280;
  font-size: 1rem;
  margin: 0 0 2rem 0;
  max-width: 400px;
}

.btn-retry {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
}

/* Main Content */
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* KPI Section */
.kpi-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.kpi-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  z-index: 1; /* Z-index bas pour les cartes KPI */
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
  transform-origin: left;
  transition: transform 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.kpi-card:hover::before {
  transform: scaleX(1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.kpi-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.kpi-trend.positive {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.kpi-trend.negative {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.trend-indicator {
  font-size: 1rem;
}

.kpi-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.kpi-label {
  font-size: 1rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.1;
}

.kpi-value.positive {
  color: #10b981;
}

.kpi-value.negative {
  color: #ef4444;
}

.kpi-description {
  font-size: 0.9rem;
  color: #9ca3af;
  margin: 0;
}

.click-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #667eea;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.kpi-card:hover .click-indicator {
  opacity: 1;
  transform: translateY(0);
}

.click-icon {
  font-size: 1rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
  60% {
    transform: translateY(-2px);
  }
}

/* Effet de survol spécifique par type */
.kpi-card.revenue:hover {
  border-left: 4px solid #10b981;
}

.kpi-card.expenses:hover {
  border-left: 4px solid #ef4444;
}

.kpi-card.profit:hover {
  border-left: 4px solid #667eea;
}

.kpi-card.margin:hover {
  border-left: 4px solid #f59e0b;
}

/* Chart Section */
.chart-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.chart-icon {
  font-size: 1.5rem;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
  background: #f3f4f6;
  padding: 0.25rem;
  border-radius: 12px;
}

.chart-type-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;
  color: #6b7280;
}

.chart-type-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-type-btn:hover:not(.active) {
  color: #374151;
  background: rgba(255, 255, 255, 0.5);
}

.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}

.financial-chart {
  width: 100% !important;
  height: 100% !important;
}

/* Table Section */
.table-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.table-icon {
  font-size: 1.5rem;
}

.table-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  background: white;
  transition: all 0.3s ease;
  min-width: 200px;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  font-size: 1.1rem;
  color: #9ca3af;
}

.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.financial-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.financial-table th {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.95rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.financial-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: #f8fafc;
}

.table-row.profit-row {
  border-left: 4px solid #10b981;
}

.table-row.loss-row {
  border-left: 4px solid #ef4444;
}

.month-cell {
  font-weight: 600;
}

.month-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.month-name {
  color: #1f2937;
  font-size: 1rem;
  text-transform: capitalize;
}

.month-date {
  color: #9ca3af;
  font-size: 0.8rem;
}

.amount-cell {
  text-align: right;
  font-weight: 600;
  font-family: 'Monaco', 'Menlo', monospace;
}

.amount-cell.revenue .amount-value {
  color: #10b981;
}

.amount-cell.expense .amount-value {
  color: #ef4444;
}

.amount-cell.result .amount-value.positive {
  color: #10b981;
}

.amount-cell.result .amount-value.negative {
  color: #ef4444;
}

.margin-cell {
  text-align: center;
}

.margin-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.margin-value {
  font-weight: 600;
  font-size: 0.9rem;
}

.margin-wrapper.excellent .margin-value {
  color: #10b981;
}

.margin-wrapper.good .margin-value {
  color: #059669;
}

.margin-wrapper.average .margin-value {
  color: #d97706;
}

.margin-wrapper.poor .margin-value {
  color: #ef4444;
}

.margin-bar {
  width: 60px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.margin-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.margin-wrapper.excellent .margin-fill {
  background: linear-gradient(90deg, #10b981, #059669);
}

.margin-wrapper.good .margin-fill {
  background: linear-gradient(90deg, #059669, #047857);
}

.margin-wrapper.average .margin-fill {
  background: linear-gradient(90deg, #d97706, #b45309);
}

.margin-wrapper.poor .margin-fill {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.totals-row {
  background: #f8fafc;
  border-top: 2px solid #e5e7eb;
}

.totals-row td {
  font-weight: 700;
  padding: 1.25rem 1rem;
  border-bottom: none;
}

.total-label {
  color: #374151;
  font-size: 1rem;
}

.total-amount.revenue {
  color: #10b981;
}

.total-amount.expense {
  color: #ef4444;
}

.total-amount.result.positive {
  color: #10b981;
}

.total-amount.result.negative {
  color: #ef4444;
}

.margin-total {
  color: #667eea;
  font-size: 1.1rem;
}

/* Empty States */
.empty-state,
.no-year-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.empty-icon,
.no-year-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.6;
}

.empty-title,
.no-year-title {
  color: #374151;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.empty-message,
.no-year-message {
  color: #6b7280;
  font-size: 1rem;
  margin: 0 0 2rem 0;
  max-width: 400px;
  line-height: 1.6;
}

.btn-reload {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-reload:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .kpi-section {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .financial-dashboard {
    padding: 1rem;
  }
  
  .dashboard-header {
    padding: 1.5rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
  
  .dashboard-title {
    font-size: 2rem;
    text-align: center;
  }
  
  .header-controls {
    justify-content: center;
  }
  
  .kpi-section {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .kpi-card {
    padding: 1.5rem;
  }
  
  .chart-section,
  .table-section {
    padding: 1.5rem;
  }
  
  .chart-header,
  .table-header {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .chart-container {
    height: 300px;
  }
  
  .search-input {
    min-width: 100%;
  }
  
  .financial-table {
    font-size: 0.9rem;
  }
  
  .financial-table th,
  .financial-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .click-indicator {
    font-size: 0.6rem;
    padding: 0.25rem;
  }
  
  .kpi-card:hover {
    transform: translateY(-3px);
  }
  
  .amount-col,
  .margin-col {
    min-width: 100px;
  }
}

@media (max-width: 480px) {
  .dashboard-title {
    font-size: 1.5rem;
  }
  
  .title-icon {
    font-size: 2rem;
  }
  
  .kpi-value {
    font-size: 1.8rem;
  }
  
  .kpi-icon {
    font-size: 2rem;
  }
  
  .chart-title,
  .table-title {
    font-size: 1.25rem;
  }
  
  .btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}

/* Print Styles */
@media print {
  .financial-dashboard {
    background: white;
    padding: 1rem;
  }
  
  .dashboard-header,
  .kpi-card,
  .chart-section,
  .table-section {
    background: white;
    box-shadow: none;
    border: 1px solid #e5e7eb;
  }
  
  .header-actions,
  .chart-controls,
  .search-box {
    display: none;
  }
  
  .kpi-card:hover {
    transform: none;
  }
  
  .click-indicator {
    display: none;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard-content {
  animation: fadeIn 0.6s ease-out;
}

.kpi-card {
  animation: fadeIn 0.6s ease-out;
}

.kpi-card:nth-child(1) { animation-delay: 0.1s; }
.kpi-card:nth-child(2) { animation-delay: 0.2s; }
.kpi-card:nth-child(3) { animation-delay: 0.3s; }
.kpi-card:nth-child(4) { animation-delay: 0.4s; }

/* Focus styles for accessibility */
.btn:focus,
.year-select:focus,
.search-input:focus,
.chart-type-btn:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .financial-dashboard {
    background: white;
  }
  
  .dashboard-header,
  .kpi-card,
  .chart-section,
  .table-section {
    background: white;
    border: 2px solid #000;
  }
  
  .kpi-value,
  .chart-title,
  .table-title {
    color: #000;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .loading-spinner {
    animation: none;
    border: 4px solid #667eea;
  }
  
  .click-icon {
    animation: none;
  }
}
</style>