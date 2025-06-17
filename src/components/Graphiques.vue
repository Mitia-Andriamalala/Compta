<template>
  <div class="graphiques-page">
    <!-- Header -->
    <div class="header-section">
      <div class="header-content">
        <button @click="goBack" class="back-btn">
          ← Retour
        </button>
        <h1 class="page-title">
          <span class="title-icon">📈</span>
          {{ pageTitle }}
        </h1>
        <p class="page-subtitle">{{ pageSubtitle }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>Génération des graphiques...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="main-container">
      <!-- Debug Section (à supprimer une fois que ça marche) -->
      <div class="debug-section" style="background: #fee2e2; border: 2px solid #fca5a5; border-radius: 8px; padding: 1rem; margin-bottom: 2rem;">
        <h4 style="color: #dc2626; margin: 0 0 1rem 0;">🐛 Debug des Graphiques</h4>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <button @click="debugChartState" style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
            🔍 État des Graphiques
          </button>
          <button @click="forceRecreateCharts" style="background: #059669; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
            🔄 Recréer les Graphiques
          </button>
          <div style="font-size: 0.9rem; color: #374151;">
            Mode: {{ mode }} | Charts: {{ Object.keys(charts).length }} | 
            Chart.js: {{ chartJsLoaded ? '✅' : '❌' }}
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls-section">
        <div class="controls-card">
          <h3>⚙️ Paramètres d'Affichage</h3>
          <div class="controls-row">
            <div class="control-item">
              <label>Période :</label>
              <select v-model="period" @change="updateGraphiques" class="control-select">
                <option value="7">7 jours</option>
                <option value="30">30 jours</option>
                <option value="90">3 mois</option>
              </select>
            </div>
            <div class="control-item">
              <label>Type :</label>
              <select v-model="chartType" @change="updateGraphiques" class="control-select">
                <option value="line">📈 Ligne</option>
                <option value="bar">📊 Barres</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Graphiques -->
      <div class="charts-section">
        <!-- Vue Classe -->
        <div v-if="mode === 'class'" class="class-view">
          <div class="chart-card main-chart">
            <div class="chart-header">
              <h3>{{ classIcon }} Évolution Classe {{ selectedClass }}</h3>
              <span class="period-badge">{{ period }} derniers jours</span>
            </div>
            <div class="chart-container">
              <canvas ref="mainChart"></canvas>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="color-box debit"></span>
                <span>Débits</span>
              </div>
              <div class="legend-item">
                <span class="color-box credit"></span>
                <span>Crédits</span>
              </div>
              <div class="legend-item">
                <span class="color-box balance"></span>
                <span>Solde</span>
              </div>
            </div>
          </div>

          <div class="chart-card pie-chart">
            <div class="chart-header">
              <h3>📊 Répartition Comptes</h3>
            </div>
            <div class="chart-container">
              <canvas ref="pieChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Vue Globale -->
        <div v-if="mode === 'global'" class="global-view">
          <div class="chart-card full-width">
            <div class="chart-header">
              <h3>🌍 Vue d'Ensemble - Toutes Classes</h3>
            </div>
            <div class="chart-container">
              <canvas ref="globalChart"></canvas>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h3>🥧 Répartition Classes</h3>
            </div>
            <div class="chart-container">
              <canvas ref="classesChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="stats-section">
        <div class="stats-card">
          <h3>📊 Statistiques {{ period }} jours</h3>
          <div class="stats-grid">
            <div class="stat-box">
              <span class="stat-label">Total Débits</span>
              <span class="stat-value debit">{{ formatMoney(stats.totalDebit) }}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Total Crédits</span>
              <span class="stat-value credit">{{ formatMoney(stats.totalCredit) }}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Solde Net</span>
              <span class="stat-value" :class="stats.balance >= 0 ? 'positive' : 'negative'">
                {{ formatMoney(stats.balance) }}
              </span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Nombre Comptes</span>
              <span class="stat-value">{{ stats.accountCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GraphiquesPage',
  data() {
    return {
      loading: true,
      chartJsLoaded: false,
      mode: 'class', // 'class' ou 'global'
      selectedClass: null,
      period: '30',
      chartType: 'line',
      
      // Données
      classData: null,
      allClassData: null,
      allAccountsData: [],
      
      // Charts
      charts: {},
      
      // Stats
      stats: {
        totalDebit: 0,
        totalCredit: 0,
        balance: 0,
        accountCount: 0
      }
    };
  },
  
  computed: {
    pageTitle() {
      if (this.mode === 'class') {
        return `Graphiques Classe ${this.selectedClass}`;
      }
      return 'Graphiques Globaux';
    },
    
    pageSubtitle() {
      if (this.mode === 'class') {
        return this.getClassLabel(this.selectedClass);
      }
      return 'Vue d\'ensemble de toutes les classes';
    },
    
    classIcon() {
      return this.getClassIcon(this.selectedClass);
    }
  },
  
  async mounted() {
    await this.init();
  },
  
  beforeUnmount() {
    this.destroyCharts();
  },
  
  methods: {
    async init() {
      try {
        console.log('🚀 Initialisation page graphiques...');
        
        // Récupérer les paramètres URL
        const query = this.$route.query;
        console.log('📝 Paramètres URL:', query);
        
        if (query.classe) {
          this.mode = 'class';
          this.selectedClass = query.classe;
          
          // Récupérer les données de la classe
          const classDataStr = sessionStorage.getItem('classData');
          if (classDataStr) {
            this.classData = JSON.parse(classDataStr);
            console.log('📊 Mode classe:', this.selectedClass, this.classData);
          } else {
            console.warn('⚠️ Données de classe non trouvées dans sessionStorage');
            // Fallback : récupérer depuis allClassTotals
            const allClassStr = sessionStorage.getItem('allClassTotals');
            if (allClassStr) {
              const allClass = JSON.parse(allClassStr);
              this.classData = allClass[this.selectedClass];
              console.log('📊 Données classe récupérées depuis allClassTotals:', this.classData);
            }
          }
        } else if (query.vue === 'global') {
          this.mode = 'global';
          const allClassStr = sessionStorage.getItem('allClassTotals');
          if (allClassStr) {
            this.allClassData = JSON.parse(allClassStr);
            console.log('🌍 Mode global:', this.allClassData);
          } else {
            console.warn('⚠️ Données globales non trouvées');
          }
        }
        
        // Récupérer toutes les données des comptes
        const allAccountsStr = sessionStorage.getItem('allAccountsData');
        if (allAccountsStr) {
          this.allAccountsData = JSON.parse(allAccountsStr);
          console.log('📋 Comptes chargés:', this.allAccountsData.length);
        }
        
        // Charger Chart.js
        console.log('📦 Chargement de Chart.js...');
        await this.loadChartJS();
        console.log('✅ Chart.js chargé, attente du DOM...');
        
        // IMPORTANT: Attendre que le DOM soit complètement prêt
        const domReady = await this.waitForDOM();
        
        if (domReady) {
          console.log('🎯 DOM prêt, création des graphiques...');
          // Créer les graphiques
          this.createCharts();
        } else {
          console.warn('⚠️ DOM non prêt, tentative de création différée...');
          // Tentative différée
          setTimeout(() => {
            console.log('🔄 Tentative différée de création des graphiques...');
            this.createCharts();
          }, 500);
        }
        
        this.calculateStats();
        
        console.log('🎉 Initialisation terminée');
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
      } finally {
        this.loading = false;
      }
    },

    async waitForDOM() {
      console.log('⏳ Attente du DOM...');
      
      // Attendre plusieurs cycles
      for (let i = 0; i < 5; i++) {
        await this.$nextTick();
      }
      
      // Attendre que les canvas soient disponibles
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        console.log(`🔍 Tentative ${attempts + 1}/${maxAttempts} - Vérification des refs...`);
        
        if (this.mode === 'class') {
          if (this.$refs.mainChart && this.$refs.pieChart) {
            console.log('✅ Refs de classe trouvées !');
            return true; // Succès
          }
        } else if (this.mode === 'global') {
          if (this.$refs.globalChart && this.$refs.classesChart) {
            console.log('✅ Refs globales trouvées !');
            return true; // Succès
          }
        }
        
        console.log('⏳ Refs non disponibles, attente...');
        await new Promise(resolve => setTimeout(resolve, 100));
        await this.$nextTick();
        attempts++;
      }
      
      // Log final des refs
      console.log('🔍 État final des refs:', {
        mainChart: !!this.$refs.mainChart,
        pieChart: !!this.$refs.pieChart,
        globalChart: !!this.$refs.globalChart,
        classesChart: !!this.$refs.classesChart
      });
      
      return false; // Échec
    },
    
    async loadChartJS() {
      return new Promise((resolve, reject) => {
        // Vérifier si Chart.js est déjà disponible
        if (typeof Chart !== 'undefined') {
          console.log('✅ Chart.js déjà chargé');
          this.chartJsLoaded = true;
          resolve();
          return;
        }
        
        console.log('📦 Chargement de Chart.js...');
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.js';
        script.crossOrigin = 'anonymous';
        
        script.onload = () => {
          console.log('✅ Chart.js chargé avec succès');
          if (typeof Chart !== 'undefined') {
            console.log('🎯 Chart.js disponible:', Chart);
            this.chartJsLoaded = true;
            resolve();
          } else {
            console.error('❌ Chart.js chargé mais non disponible');
            reject(new Error('Chart.js non disponible après chargement'));
          }
        };
        
        script.onerror = (error) => {
          console.error('❌ Erreur chargement Chart.js:', error);
          reject(error);
        };
        
        document.head.appendChild(script);
      });
    },
    
    createCharts() {
      try {
        if (!this.chartJsLoaded || typeof Chart === 'undefined') {
          console.error('❌ Chart.js non disponible');
          return;
        }
        
        console.log('🎨 Création des graphiques...');
        console.log('📊 Mode actuel:', this.mode);
        
        // Vérifier immédiatement les refs
        console.log('🔍 Vérification immédiate des refs:', {
          mainChart: !!this.$refs.mainChart,
          pieChart: !!this.$refs.pieChart,
          globalChart: !!this.$refs.globalChart,
          classesChart: !!this.$refs.classesChart
        });
        
        if (this.mode === 'class') {
          console.log('🎯 Création des graphiques de classe...');
          this.createClassCharts();
        } else {
          console.log('🌍 Création des graphiques globaux...');
          this.createGlobalCharts();
        }
        
        // Marquer les conteneurs comme chargés
        this.$nextTick(() => {
          document.querySelectorAll('.chart-container').forEach(container => {
            container.classList.add('loaded');
          });
        });
        
      } catch (error) {
        console.error('❌ Erreur lors de la création des graphiques:', error);
      }
    },
    
    createClassCharts() {
      console.log('📊 createClassCharts() appelée');
      console.log('mainChart ref disponible:', !!this.$refs.mainChart);
      console.log('pieChart ref disponible:', !!this.$refs.pieChart);
      
      // Graphique principal de la classe
      if (this.$refs.mainChart) {
        console.log('🎯 Création du graphique principal...');
        this.createMainChart();
      } else {
        console.error('❌ Référence mainChart non trouvée');
      }
      
      // Graphique camembert des comptes
      if (this.$refs.pieChart) {
        console.log('🥧 Création du graphique en secteurs...');
        this.createPieChart();
      } else {
        console.error('❌ Référence pieChart non trouvée');
      }
    },
    
    createGlobalCharts() {
      console.log('🌍 createGlobalCharts() appelée');
      console.log('globalChart ref disponible:', !!this.$refs.globalChart);
      console.log('classesChart ref disponible:', !!this.$refs.classesChart);
      
      // Graphique global
      if (this.$refs.globalChart) {
        console.log('🌍 Création du graphique global...');
        this.createGlobalChart();
      } else {
        console.error('❌ Référence globalChart non trouvée');
      }
      
      // Graphique répartition classes
      if (this.$refs.classesChart) {
        console.log('📊 Création du graphique des classes...');
        this.createClassesChart();
      } else {
        console.error('❌ Référence classesChart non trouvée');
      }
    },
    
    createMainChart() {
      try {
        console.log('🎯 createMainChart() - Début');
        
        if (!this.$refs.mainChart) {
          console.error('❌ Référence mainChart non trouvée');
          return;
        }
        
        if (typeof Chart === 'undefined') {
          console.error('❌ Chart.js non disponible pour mainChart');
          return;
        }
        
        console.log('📊 Element mainChart:', this.$refs.mainChart);
        
        const ctx = this.$refs.mainChart.getContext('2d');
        if (!ctx) {
          console.error('❌ Impossible d\'obtenir le contexte 2D');
          return;
        }
        
        console.log('✅ Contexte 2D obtenu:', ctx);
        
        const data = this.generateEvolutionData();
        console.log('📈 Données générées pour mainChart:', data);
        
        // Vérifier que nous avons des données valides
        if (!data.dates || data.dates.length === 0) {
          console.error('❌ Pas de données pour le graphique');
          return;
        }
        
        const config = {
          type: this.chartType,
          data: {
            labels: data.dates,
            datasets: [
              {
                label: 'Débits',
                data: data.debits,
                borderColor: '#dc2626',
                backgroundColor: this.chartType === 'bar' ? 'rgba(220, 38, 38, 0.7)' : 'rgba(220, 38, 38, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: this.chartType === 'line'
              },
              {
                label: 'Crédits',
                data: data.credits,
                borderColor: '#059669',
                backgroundColor: this.chartType === 'bar' ? 'rgba(5, 150, 105, 0.7)' : 'rgba(5, 150, 105, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: this.chartType === 'line'
              },
              {
                label: 'Solde',
                data: data.soldes,
                borderColor: '#667eea',
                backgroundColor: this.chartType === 'bar' ? 'rgba(102, 126, 234, 0.7)' : 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: false
              }
            ]
          },
          options: this.getChartOptions()
        };
        
        console.log('⚙️ Configuration du graphique:', config);
        
        // Détruire le graphique existant
        this.destroyChart('mainChart');
        
        // Créer le nouveau graphique
        console.log('🔨 Création du graphique avec new Chart()...');
        this.charts.mainChart = new Chart(ctx, config);
        console.log('✅ MainChart créé avec succès:', this.charts.mainChart);
        
      } catch (error) {
        console.error('❌ Erreur création mainChart:', error);
        console.error('Stack trace:', error.stack);
      }
    },
    
    createPieChart() {
      try {
        console.log('🥧 createPieChart() - Début');
        
        if (!this.$refs.pieChart) {
          console.error('❌ Référence pieChart non trouvée');
          return;
        }
        
        if (!this.classData || !this.classData.accounts) {
          console.warn('⚠️ Données de classe non disponibles pour pieChart');
          console.log('classData:', this.classData);
          return;
        }
        
        if (typeof Chart === 'undefined') {
          console.error('❌ Chart.js non disponible pour pieChart');
          return;
        }
        
        const ctx = this.$refs.pieChart.getContext('2d');
        const accounts = this.classData.accounts;
        
        console.log('🥧 Création pieChart avec', accounts.length, 'comptes');
        console.log('📊 Données des comptes:', accounts);
        
        // Vérifier qu'on a des données valides
        const validAccounts = accounts.filter(acc => acc.balance && typeof acc.balance.balance === 'number');
        if (validAccounts.length === 0) {
          console.warn('⚠️ Aucun compte avec des données valides');
          return;
        }
        
        const config = {
          type: 'doughnut',
          data: {
            labels: validAccounts.map(acc => acc.Value),
            datasets: [{
              data: validAccounts.map(acc => Math.abs(acc.balance.balance || 0)),
              backgroundColor: [
                '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
                '#06b6d4', '#ef4444', '#22c55e', '#6b7280'
              ],
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { 
                  font: { size: 12 },
                  padding: 15,
                  usePointStyle: true
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = this.formatMoney(context.parsed);
                    return `${context.label}: ${value}`;
                  }
                }
              }
            }
          }
        };
        
        console.log('⚙️ Configuration pieChart:', config);
        
        this.destroyChart('pieChart');
        console.log('🔨 Création du pieChart avec new Chart()...');
        this.charts.pieChart = new Chart(ctx, config);
        console.log('✅ PieChart créé avec succès:', this.charts.pieChart);
        
      } catch (error) {
        console.error('❌ Erreur création pieChart:', error);
        console.error('Stack trace:', error.stack);
      }
    },
    
    createGlobalChart() {
      try {
        if (!this.$refs.globalChart) {
          console.warn('⚠️ Référence globalChart non trouvée');
          return;
        }
        
        if (typeof Chart === 'undefined') {
          console.error('❌ Chart.js non disponible pour globalChart');
          return;
        }
        
        const ctx = this.$refs.globalChart.getContext('2d');
        const data = this.generateGlobalEvolutionData();
        
        const config = {
          type: this.chartType,
          data: {
            labels: data.dates,
            datasets: data.datasets
          },
          options: this.getChartOptions()
        };
        
        this.destroyChart('globalChart');
        this.charts.globalChart = new Chart(ctx, config);
        console.log('✅ GlobalChart créé avec succès');
        
      } catch (error) {
        console.error('❌ Erreur création globalChart:', error);
      }
    },
    
    createClassesChart() {
      try {
        if (!this.$refs.classesChart) {
          console.warn('⚠️ Référence classesChart non trouvée');
          return;
        }
        
        if (!this.allClassData) {
          console.warn('⚠️ Données de classes non disponibles');
          return;
        }
        
        if (typeof Chart === 'undefined') {
          console.error('❌ Chart.js non disponible pour classesChart');
          return;
        }
        
        const ctx = this.$refs.classesChart.getContext('2d');
        const classes = Object.keys(this.allClassData);
        
        const config = {
          type: 'pie',
          data: {
            labels: classes.map(c => `Classe ${c}`),
            datasets: [{
              data: classes.map(c => Math.abs(this.allClassData[c].balance || 0)),
              backgroundColor: [
                '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
                '#06b6d4', '#ef4444', '#22c55e', '#6b7280'
              ],
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { 
                  font: { size: 12 },
                  padding: 15,
                  usePointStyle: true
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = this.formatMoney(context.parsed);
                    return `${context.label}: ${value}`;
                  }
                }
              }
            }
          }
        };
        
        this.destroyChart('classesChart');
        this.charts.classesChart = new Chart(ctx, config);
        console.log('✅ ClassesChart créé avec succès');
        
      } catch (error) {
        console.error('❌ Erreur création classesChart:', error);
      }
    },
    
    generateEvolutionData() {
      try {
        const days = parseInt(this.period);
        const dates = [];
        const debits = [];
        const credits = [];
        const soldes = [];
        
        // Générer les dates
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          dates.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
        }
        
        // Récupérer les données de base
        let baseDebit = 0;
        let baseCredit = 0;
        let baseBalance = 0;
        
        if (this.classData) {
          baseDebit = this.classData.totalDebit || 0;
          baseCredit = this.classData.totalCredit || 0;
          baseBalance = this.classData.balance || 0;
        }
        
        console.log('📊 Données de base:', { baseDebit, baseCredit, baseBalance });
        
        // Générer les données simulées
        for (let i = 0; i < days; i++) {
          const variation = Math.sin(i * 0.2) * 0.15 + (Math.random() - 0.5) * 0.1;
          const factor = 1 + variation;
          
          debits.push(Math.max(0, baseDebit * factor));
          credits.push(Math.max(0, baseCredit * factor));
          soldes.push(baseBalance * factor);
        }
        
        return { dates, debits, credits, soldes };
        
      } catch (error) {
        console.error('❌ Erreur génération données évolution:', error);
        return { dates: [], debits: [], credits: [], soldes: [] };
      }
    },
    
    generateGlobalEvolutionData() {
      try {
        const days = parseInt(this.period);
        const dates = [];
        const datasets = [];
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#22c55e', '#6b7280'];
        
        // Générer les dates
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          dates.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
        }
        
        // Créer un dataset par classe
        let colorIndex = 0;
        Object.keys(this.allClassData).forEach(className => {
          const classData = this.allClassData[className];
          const data = [];
          
          for (let i = 0; i < days; i++) {
            const variation = Math.sin(i * 0.2) * 0.15 + (Math.random() - 0.5) * 0.1;
            const factor = 1 + variation;
            data.push((classData.balance || 0) * factor);
          }
          
          datasets.push({
            label: `Classe ${className}`,
            data: data,
            borderColor: colors[colorIndex % colors.length],
            backgroundColor: colors[colorIndex % colors.length] + '20',
            borderWidth: 2,
            tension: 0.4,
            fill: this.chartType === 'area'
          });
          
          colorIndex++;
        });
        
        return { dates, datasets };
        
      } catch (error) {
        console.error('❌ Erreur génération données globales:', error);
        return { dates: [], datasets: [] };
      }
    },
    
    getChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = this.formatMoney(context.parsed.y || context.parsed);
                return `${context.dataset.label}: ${value}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,0.1)' },
            ticks: { font: { size: 11 } }
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.1)' },
            ticks: {
              font: { size: 11 },
              callback: (value) => this.formatMoney(value)
            }
          }
        }
      };
    },
    
    calculateStats() {
      try {
        if (this.mode === 'class' && this.classData) {
          this.stats = {
            totalDebit: this.classData.totalDebit || 0,
            totalCredit: this.classData.totalCredit || 0,
            balance: this.classData.balance || 0,
            accountCount: this.classData.count || 0
          };
        } else if (this.mode === 'global' && this.allClassData) {
          let totalDebit = 0;
          let totalCredit = 0;
          let balance = 0;
          let accountCount = 0;
          
          Object.values(this.allClassData).forEach(classData => {
            totalDebit += classData.totalDebit || 0;
            totalCredit += classData.totalCredit || 0;
            balance += classData.balance || 0;
            accountCount += classData.count || 0;
          });
          
          this.stats = { totalDebit, totalCredit, balance, accountCount };
        }
        
        console.log('📊 Stats calculées:', this.stats);
        
      } catch (error) {
        console.error('❌ Erreur calcul statistiques:', error);
      }
    },
    
    async updateGraphiques() {
      try {
        this.loading = true;
        await this.$nextTick();
        this.createCharts();
        this.calculateStats();
      } catch (error) {
        console.error('❌ Erreur mise à jour graphiques:', error);
      } finally {
        this.loading = false;
      }
    },
    
    destroyChart(name) {
      if (this.charts[name]) {
        this.charts[name].destroy();
        delete this.charts[name];
      }
    },
    
    destroyCharts() {
      Object.keys(this.charts).forEach(name => {
        this.destroyChart(name);
      });
    },
    
    goBack() {
      this.$router.go(-1);
    },
    
    formatMoney(value) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value || 0);
    },
    
    getClassLabel(classNumber) {
      const labels = {
        '1': 'Comptes de Capitaux',
        '2': 'Comptes d\'Immobilisations',
        '3': 'Comptes de Stocks',
        '4': 'Comptes de Tiers',
        '5': 'Comptes Financiers',
        '6': 'Comptes de Charges',
        '7': 'Comptes de Produits',
        '8': 'Comptes Spéciaux'
      };
      return labels[classNumber] || '';
    },
    
    getClassIcon(classNumber) {
      const icons = {
        '1': '🏛️', '2': '🏗️', '3': '📦', '4': '🤝',
        '5': '💰', '6': '📉', '7': '📈', '8': '⚙️'
      };
      return icons[classNumber] || '📊';
    },

    // Méthode de debug pour vérifier l'état
    debugChartState() {
      console.log('🔍 État actuel des graphiques:');
      console.log('- Mode:', this.mode);
      console.log('- ClassData:', this.classData);
      console.log('- AllClassData:', this.allClassData);
      console.log('- Charts créés:', Object.keys(this.charts));
      console.log('- Refs disponibles:', {
        mainChart: !!this.$refs.mainChart,
        pieChart: !!this.$refs.pieChart,
        globalChart: !!this.$refs.globalChart,
        classesChart: !!this.$refs.classesChart
      });
      console.log('- Chart.js disponible:', this.chartJsLoaded);
      console.log('- Loading état:', this.loading);
    },

    // Méthode pour forcer la recréation des graphiques
    async forceRecreateCharts() {
      console.log('🔄 Recréation forcée des graphiques...');
      this.destroyCharts();
      
      console.log('🔍 État des refs avant recréation:', {
        mainChart: !!this.$refs.mainChart,
        pieChart: !!this.$refs.pieChart,
        globalChart: !!this.$refs.globalChart,
        classesChart: !!this.$refs.classesChart
      });
      
      // Attendre que le DOM soit prêt
      const domReady = await this.waitForDOM();
      
      if (domReady || this.$refs.mainChart || this.$refs.pieChart) {
        console.log('🎯 DOM disponible, recréation des graphiques...');
        this.createCharts();
      } else {
        console.error('❌ Impossible de recréer - refs non disponibles');
      }
    }
  }
};
</script>

<style scoped>
.graphiques-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Header */
.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  position: relative;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.title-icon {
  font-size: 1.8rem;
}

.page-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
}

/* Loading */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-content {
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Main Container */
.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  top: -1rem;
}

/* Controls */
.controls-section {
  margin-bottom: 2rem;
}

.controls-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.controls-card h3 {
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1.1rem;
}

.controls-row {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 150px;
}

.control-item label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.control-select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.control-select:focus {
  outline: none;
  border-color: #667eea;
}

/* Charts */
.charts-section {
  margin-bottom: 2rem;
}

.class-view {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.global-view {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.chart-card.main-chart {
  grid-column: 1;
}

.chart-card.pie-chart {
  grid-column: 2;
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.chart-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.2rem;
  font-weight: 600;
}

.period-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
}

.chart-container {
  position: relative;
  height: 300px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 1rem;
}

.chart-container canvas {
  width: 100% !important;
  height: 100% !important;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #374151;
}

.color-box {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.color-box.debit { background: #dc2626; }
.color-box.credit { background: #059669; }
.color-box.balance { background: #667eea; }

/* Stats */
.stats-section {
  margin-top: 2rem;
}

.stats-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.stats-card h3 {
  margin: 0 0 1.5rem 0;
  color: #1e293b;
  font-size: 1.3rem;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-box {
  text-align: center;
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.stat-value {
  display: block;
  font-size: 1.4rem;
  font-weight: 700;
  font-family: 'Monaco', 'Consolas', monospace;
  color: #1e293b;
}

.stat-value.debit { color: #dc2626; }
.stat-value.credit { color: #059669; }
.stat-value.positive { color: #059669; }
.stat-value.negative { color: #dc2626; }

/* Responsive */
@media (max-width: 1024px) {
  .class-view, .global-view {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    height: 250px;
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 1rem;
  }
  
  .back-btn {
    position: static;
    transform: none;
    margin-bottom: 1rem;
  }
  
  .header-content {
    text-align: left;
  }
  
  .page-title {
    font-size: 1.6rem;
    justify-content: flex-start;
  }
  
  .controls-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .control-item {
    min-width: auto;
  }
  
  .chart-legend {
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.4rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .chart-container {
    height: 200px;
    padding: 0.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-box {
    padding: 1rem;
  }
  
  .stat-value {
    font-size: 1.2rem;
  }
  
  .controls-card {
    padding: 1rem;
  }
  
  .stats-card {
    padding: 1rem;
  }
  
  .chart-card {
    padding: 1rem;
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

.chart-card, .controls-card, .stats-card {
  animation: fadeIn 0.6s ease-out;
}

.chart-card:nth-child(1) { animation-delay: 0.1s; }
.chart-card:nth-child(2) { animation-delay: 0.2s; }
.stats-card { animation-delay: 0.3s; }

/* Hover Effects */
.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.stat-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* Focus States */
.back-btn:focus,
.control-select:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Print Styles */
@media print {
  .header-section,
  .controls-section,
  .back-btn {
    display: none !important;
  }
  
  .chart-card,
  .stats-card {
    box-shadow: none !important;
    border: 1px solid #ccc;
    break-inside: avoid;
  }
  
  .chart-container {
    height: 300px;
  }
  
  .main-container {
    top: 0;
    padding: 1rem;
  }
}

/* Loading Chart Effect */
.chart-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  z-index: 1;
}

.chart-container.loaded::before {
  display: none;
}
</style>