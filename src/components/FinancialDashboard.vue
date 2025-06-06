<template>
  <div class="page-container">
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

      <!-- Contenu principal -->
      <div v-else-if="!error">
        
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
              <button class="chart-btn active" data-type="line">
                📈 Ligne
              </button>
              <button class="chart-btn" data-type="bar">
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
      selectedYear: new Date().getFullYear(),
      chart: null,
      financialData: [],
      availableYears: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      showExportMenu: false
    }
  },
  computed: {
    filteredData() {
      return this.financialData.filter(item => {
        const itemYear = new Date(item.mois).getFullYear()
        return itemYear === this.selectedYear
      })
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
        acc.chiffreAffaires += curr.chiffreAffaires
        acc.charges += curr.charges
        acc.resultatNet += curr.resultatNet
        return acc
      }, { chiffreAffaires: 0, charges: 0, resultatNet: 0 })
    }
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(value)
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR', { 
        month: 'long'
      })
    },
    calculateMargin() {
      if (this.totals.chiffreAffaires === 0) return 0
      return ((this.totals.resultatNet / this.totals.chiffreAffaires) * 100).toFixed(1)
    },
    formatMargin(data) {
      if (data.chiffreAffaires === 0) return 0
      return ((data.resultatNet / data.chiffreAffaires) * 100).toFixed(1)
    },
    getMarginClass(data) {
      const margin = this.formatMargin(data)
      if (margin > 20) return 'excellent'
      if (margin > 10) return 'good'
      if (margin > 0) return 'average'
      return 'poor'
    },
    refreshData() {
      this.fetchData()
    },
    toggleExportMenu() {
      this.showExportMenu = !this.showExportMenu;
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
    async fetchData() {
      this.isLoading = true;
      this.error = null;
      try {
        const token = sessionStorage.getItem('authToken');

        const accountsRes = await axios.get('/api/v1/models/C_ElementValue', {
          params: {
            'fields': 'C_ElementValue_ID,Value,Name,AccountType'
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const accountTypeMap = {};
        accountsRes.data.records.forEach(ev => {
          accountTypeMap[ev.C_ElementValue_ID] = ev.AccountType;
        });

        const yearStart = `${this.selectedYear}-01-01`;
        const yearEnd = `${this.selectedYear}-12-31`;
        const factRes = await axios.get('/api/v1/models/Fact_Acct', {
          params: {
            '$filter': `AD_Client_ID eq 11 and AD_Org_ID eq 11 and DateAcct ge '${yearStart}' and DateAcct le '${yearEnd}' and PostingType eq 'A'`
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const factAcctData = factRes.data.records;

        const monthlySummary = {};
        factAcctData.forEach(line => {
          const month = line.DateAcct.substring(0, 7);
          const accountId = line.Account_ID?.id || line.Account_ID;
          const type = accountTypeMap[accountId];
          if (!monthlySummary[month]) {
            monthlySummary[month] = { chiffre_affaires: 0, charges: 0 };
          }
          if (type === 'R') {
            monthlySummary[month].chiffre_affaires += line.AmtAcctCr;
          }
          if (type === 'E') {
            monthlySummary[month].charges += line.AmtAcctDr;
          }
        });

        this.financialData = Object.entries(monthlySummary).map(([mois, vals]) => ({
          mois,
          chiffreAffaires: vals.chiffre_affaires,
          charges: vals.charges,
          resultatNet: vals.chiffre_affaires - vals.charges
        })).sort((a, b) => a.mois.localeCompare(b.mois));

        this.availableYears = [
          ...new Set(factAcctData.map(line => line.DateAcct.substring(0, 4)))
        ].sort();

        if (this.availableYears.length > 0 && !this.selectedYear) {
          this.selectedYear = Math.max(...this.availableYears);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        this.error = error.response?.data?.message || 'Erreur lors du chargement des données';
        this.financialData = [];
      } finally {
        this.isLoading = false;
      }
    },
    createChart() {
      if (!this.$refs.chartCanvas) {
        console.warn('Canvas non trouvé, graphique non créé')
        return
      }

      const ctx = this.$refs.chartCanvas.getContext('2d')
      
      if (this.chart) {
        this.chart.destroy()
      }

      if (!this.filteredData || this.filteredData.length === 0) {
        console.warn('Pas de données à afficher dans le graphique')
        return
      }

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.filteredData.map(item => {
            const date = new Date(item.mois)
            return date.toLocaleDateString('fr-FR', { month: 'short' })
          }),
          datasets: [
            {
              label: 'Chiffre d\'affaires',
              data: this.filteredData.map(item => item.chiffreAffaires),
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#10B981',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 5
            },
            {
              label: 'Charges',
              data: this.filteredData.map(item => item.charges),
              borderColor: '#EF4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#EF4444',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 5
            },
            {
              label: 'Résultat net',
              data: this.filteredData.map(item => item.resultatNet),
              borderColor: '#667eea',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#667eea',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            title: {
              display: false
            },
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 14
                }
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
                label: (context) => {
                  return `${context.dataset.label}: ${this.formatCurrency(context.parsed.y)}`
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  size: 12
                }
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: {
                callback: (value) => this.formatCurrency(value),
                font: {
                  size: 12
                }
              }
            }
          }
        }
      })
    }
  },
  watch: {
    selectedYear: {
      handler() {
        this.fetchData()
      }
    },
    filteredData: {
      handler() {
        this.$nextTick(() => {
          this.createChart()
        })
      },
      deep: true
    }
  },
  async mounted() {
    await this.fetchData()
    this.$nextTick(() => {
      this.createChart()
    })
    
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
.loading-state, .error-state {
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

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.error-state h3, .loading-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #374151;
}

.error-state p, .loading-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
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
}

.retry-btn:hover {
  background: #5a67d8;
  transform: translateY(-1px);
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