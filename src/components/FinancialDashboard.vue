<template>
  <div class="financial-dashboard">
    <div class="dashboard-header">
      <h1>Tableau de bord financier</h1>
      <div class="year-filter">
        <label for="year-select">Année :</label>
        <select v-model="selectedYear" id="year-select" class="year-select" :disabled="isLoading">
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Indicateur de chargement -->
    <div v-if="isLoading" class="loading-spinner">
      Chargement des données...
    </div>

    <!-- Contenu principal -->
    <div v-else-if="!error">
      <!-- Tableau financier -->
      <div class="financial-table-container">
        <table class="financial-table">
          <thead>
            <tr>
              <th>Mois</th>
              <th>Chiffre d'affaires</th>
              <th>Charges</th>
              <th>Résultat net</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(data, index) in filteredData" :key="index">
              <td>{{ formatDate(data.mois) }}</td>
              <td>{{ formatCurrency(data.chiffreAffaires) }}</td>
              <td>{{ formatCurrency(data.charges) }}</td>
              <td :class="{ 'positive': data.resultatNet > 0, 'negative': data.resultatNet < 0 }">
                {{ formatCurrency(data.resultatNet) }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total</strong></td>
              <td>{{ formatCurrency(totals.chiffreAffaires) }}</td>
              <td>{{ formatCurrency(totals.charges) }}</td>
              <td :class="{ 'positive': totals.resultatNet > 0, 'negative': totals.resultatNet < 0 }">
                {{ formatCurrency(totals.resultatNet) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Graphique -->
      <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
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
      error: null
    }
  },
  computed: {
    filteredData() {
      return this.financialData.filter(item => {
        const itemYear = new Date(item.mois).getFullYear()
        return itemYear === this.selectedYear
      })
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
        year: 'numeric',
        month: 'long'
      })
    },
    async fetchData() {
      this.isLoading = true;
      this.error = null;
      try {
        const token = sessionStorage.getItem('authToken');

        // 1. Récupérer les comptes (pour le mapping Account_ID -> AccountType)
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

        // 2. Récupérer les écritures fact_acct pour l'année sélectionnée
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

        // 3. Agrégation JS
        const monthlySummary = {};
        factAcctData.forEach(line => {
          const month = line.DateAcct.substring(0, 7); // 'YYYY-MM'
          // Account_ID peut être un objet ou un ID direct selon la réponse API
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

        // 4. Mise en forme pour le tableau/graphique
        this.financialData = Object.entries(monthlySummary).map(([mois, vals]) => ({
          mois,
          chiffreAffaires: vals.chiffre_affaires,
          charges: vals.charges,
          resultatNet: vals.chiffre_affaires - vals.charges
        })).sort((a, b) => a.mois.localeCompare(b.mois));

        // 5. Années disponibles
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
      // S'assurer que le canvas existe avant de créer le graphique
      if (!this.$refs.chartCanvas) {
        console.warn('Canvas non trouvé, graphique non créé')
        return
      }

      const ctx = this.$refs.chartCanvas.getContext('2d')
      
      if (this.chart) {
        this.chart.destroy()
      }

      // S'assurer qu'il y a des données à afficher
      if (!this.filteredData || this.filteredData.length === 0) {
        console.warn('Pas de données à afficher dans le graphique')
        return
      }

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.filteredData.map(item => {
            const date = new Date(item.mois)
            return date.toLocaleDateString('fr-FR', { month: 'long' })
          }),
          datasets: [
            {
              label: 'Chiffre d\'affaires',
              data: this.filteredData.map(item => item.chiffreAffaires),
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              tension: 0.4
            },
            {
              label: 'Charges',
              data: this.filteredData.map(item => item.charges),
              borderColor: '#F44336',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              tension: 0.4
            },
            {
              label: 'Résultat net',
              data: this.filteredData.map(item => item.resultatNet),
              borderColor: '#2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Évolution financière',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              position: 'bottom'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => this.formatCurrency(value)
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
        // Attendre que le DOM soit mis à jour avant de créer le graphique
        this.$nextTick(() => {
          this.createChart()
        })
      },
      deep: true
    }
  },
  async mounted() {
    await this.fetchData()
    // Attendre que le DOM soit mis à jour avant de créer le graphique
    this.$nextTick(() => {
      this.createChart()
    })
  }
}
</script>

<style scoped>
.financial-dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.year-filter {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.year-select {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-size: 1rem;
  min-width: 120px;
}

.financial-table-container {
  margin-bottom: 2rem;
  overflow-x: auto;
}

.financial-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.financial-table th,
.financial-table td {
  padding: 1rem;
  text-align: right;
  border-bottom: 1px solid #e2e8f0;
}

.financial-table th:first-child,
.financial-table td:first-child {
  text-align: left;
}

.financial-table thead th {
  background-color: #f8fafc;
  font-weight: 600;
}

.financial-table tbody tr:hover {
  background-color: #f8fafc;
}

.positive {
  color: #4CAF50;
}

.negative {
  color: #F44336;
}

.chart-container {
  height: 400px;
  margin-top: 2rem;
}

.error-message {
  background-color: #FEE2E2;
  color: #DC2626;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #FCA5A5;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #6B7280;
  font-size: 1.1rem;
}

.loading-spinner::after {
  content: '';
  width: 1.5rem;
  height: 1.5rem;
  margin-left: 0.75rem;
  border: 2px solid #E5E7EB;
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .financial-dashboard {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .financial-table th,
  .financial-table td {
    padding: 0.75rem;
    font-size: 0.875rem;
  }
}
</style> 