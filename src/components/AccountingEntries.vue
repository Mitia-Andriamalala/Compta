<template>
  <div class="accounting-entries-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <h1>
            <span class="title-icon">📝</span>
            Saisie d'Écritures Comptables
          </h1>
          <p class="subtitle">Gestion des écritures et plan de comptes</p>
        </div>
        
        <div class="header-actions">
          <button @click="showPlanComptable = !showPlanComptable" class="btn btn-secondary">
            <span class="btn-icon">📊</span>
            {{ showPlanComptable ? 'Masquer' : 'Voir' }} Plan de Comptes
          </button>
          <button @click="exportData" class="btn btn-primary">
            <span class="btn-icon">📤</span>
            Exporter
          </button>
          <button @click="refreshData" class="btn btn-secondary" :disabled="loading">
            <span class="btn-icon">🔄</span>
            {{ loading ? 'Chargement...' : 'Actualiser' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>{{ loadingMessage }}</p>
      </div>
    </div>

    <!-- Message d'alerte -->
    <div v-if="message" class="message-alert" :class="{ 'error-message': isError }">
      <i class="fas" :class="isError ? 'fa-exclamation-triangle' : 'fa-check-circle'"></i>
      {{ message }}
    </div>

    <div class="page-content">
      <!-- Plan de Comptes (collapsible) -->
      <div v-if="showPlanComptable" class="plan-comptable-section">
        <div class="section-card">
          <div class="section-header">
            <h2>📊 Plan de Comptes ({{ comptes.length }} comptes)</h2>
            <button @click="showAddAccountForm = !showAddAccountForm" class="btn btn-outline">
              <span class="btn-icon">➕</span>
              Nouveau Compte
            </button>
          </div>

          <!-- Formulaire d'ajout de compte -->
          <div v-if="showAddAccountForm" class="add-account-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Numéro de Compte *</label>
                <input 
                  v-model="newAccount.numero" 
                  type="text" 
                  placeholder="Ex: 70600"
                  class="form-input"
                  @input="validateAccountNumber"
                  :disabled="saving"
                >
                <span v-if="accountValidation.error" class="error-text">{{ accountValidation.error }}</span>
              </div>
              
              <div class="form-group">
                <label>Libellé *</label>
                <input 
                  v-model="newAccount.libelle" 
                  type="text" 
                  placeholder="Ex: Vente de marchandises"
                  class="form-input"
                  :disabled="saving"
                >
              </div>
              
              <div class="form-group">
                <label>Type *</label>
                <select v-model="newAccount.type" class="form-select" :disabled="saving">
                  <option value="">Sélectionner un type</option>
                  <option value="A">Actif</option>
                  <option value="L">Passif</option>
                  <option value="E">Charges</option>
                  <option value="R">Produits</option>
                </select>
              </div>
              
              <div class="form-actions">
                <button @click="addAccount" :disabled="!canAddAccount || saving" class="btn btn-primary">
                  <span class="btn-icon">{{ saving ? '⏳' : '✅' }}</span>
                  {{ saving ? 'Création...' : 'Ajouter' }}
                </button>
                <button @click="cancelAddAccount" class="btn btn-secondary" :disabled="saving">
                  <span class="btn-icon">❌</span>
                  Annuler
                </button>
              </div>
            </div>
          </div>

          <!-- Liste des comptes -->
          <div class="accounts-list">
            <div class="accounts-search">
              <input 
                v-model="accountsSearch" 
                type="text" 
                placeholder="🔍 Rechercher un compte..."
                class="search-input"
              >
            </div>
            
            <div class="accounts-grid">
              <div v-for="compte in filteredComptes" :key="compte.id" class="account-card">
                <div class="account-header">
                  <span class="account-number">{{ compte.value }}</span>
                  <span class="account-type" :class="getAccountTypeClass(compte.accountType)">
                    {{ getAccountTypeLabel(compte.accountType) }}
                  </span>
                </div>
                <div class="account-name">{{ compte.name }}</div>
                <div class="account-actions">
                  <button @click="selectAccount(compte)" class="btn-icon-small" title="Sélectionner">📝</button>
                  <button @click="deleteAccount(compte)" class="btn-icon-small" title="Supprimer" :disabled="saving">🗑️</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulaire de Saisie d'Écriture -->
      <div class="entry-form-section">
        <div class="section-card">
          <div class="section-header">
            <h2>📝 Nouvelle Écriture Comptable</h2>
            <div class="form-info">
              <span class="info-item">
                <strong>Date:</strong> {{ formatDate(new Date()) }}
              </span>
              <span class="info-item">
                <strong>Référence:</strong> {{ nextReference }}
              </span>
            </div>
          </div>

          <form @submit.prevent="addEntry" class="entry-form">
            <!-- En-tête de l'écriture -->
            <div class="entry-header">
              <div class="form-grid">
                <div class="form-group">
                  <label>Date *</label>
                  <input 
                    v-model="newEntry.date" 
                    type="date" 
                    class="form-input"
                    :disabled="saving"
                    required
                  >
                </div>
                
                <div class="form-group">
                  <label>Référence *</label>
                  <input 
                    v-model="newEntry.reference" 
                    type="text" 
                    class="form-input"
                    :disabled="saving"
                    required
                  >
                </div>
                
                <div class="form-group">
                  <label>Description</label>
                  <input 
                    v-model="newEntry.description" 
                    type="text" 
                    class="form-input"
                    placeholder="Description de l'écriture"
                    :disabled="saving"
                  >
                </div>
              </div>
            </div>

            <!-- Lignes d'écriture -->
            <div class="entry-lines">
              <h3>Lignes d'écriture</h3>
              
              <div class="lines-container">
                <div v-for="(line, index) in newEntry.lines" :key="index" class="entry-line">
                  <div class="line-number">{{ index + 1 }}</div>
                  
                  <div class="line-content">
                    <div class="line-grid">
                      <div class="form-group">
                        <label>Compte *</label>
                        <select 
                          v-model="line.compte" 
                          class="form-select"
                          @change="onAccountSelect(line, index)"
                          :disabled="saving"
                          required
                        >
                          <option value="">Sélectionner un compte</option>
                          <option v-for="compte in comptes" :key="compte.id" :value="compte.id">
                            {{ compte.value }} - {{ compte.name }}
                          </option>
                        </select>
                      </div>
                      
                      <div class="form-group">
                        <label>Débit</label>
                        <input 
                          v-model.number="line.debit" 
                          type="number" 
                          step="0.01"
                          class="form-input amount-input"
                          @input="onAmountChange(index, 'debit')"
                          :disabled="saving"
                          placeholder="0,00"
                        >
                      </div>
                      
                      <div class="form-group">
                        <label>Crédit</label>
                        <input 
                          v-model.number="line.credit" 
                          type="number" 
                          step="0.01"
                          class="form-input amount-input"
                          @input="onAmountChange(index, 'credit')"
                          :disabled="saving"
                          placeholder="0,00"
                        >
                      </div>
                      
                      <div class="form-group">
                        <label>Description</label>
                        <input 
                          v-model="line.description" 
                          type="text" 
                          class="form-input"
                          :disabled="saving"
                          placeholder="Description de la ligne"
                        >
                      </div>
                      
                      <div class="line-actions">
                        <button 
                          type="button" 
                          @click="removeLine(index)" 
                          :disabled="newEntry.lines.length <= 2 || saving"
                          class="btn-icon-small remove-btn"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" @click="addLine" class="btn btn-outline add-line-btn" :disabled="saving">
                <span class="btn-icon">➕</span>
                Ajouter une ligne
              </button>
            </div>

            <!-- Équilibrage -->
            <div class="entry-balance">
              <div class="balance-info">
                <div class="balance-item">
                  <span class="balance-label">Total Débit:</span>
                  <span class="balance-value debit">{{ formatCurrency(totalDebit) }}</span>
                </div>
                <div class="balance-item">
                  <span class="balance-label">Total Crédit:</span>
                  <span class="balance-value credit">{{ formatCurrency(totalCredit) }}</span>
                </div>
                <div class="balance-item">
                  <span class="balance-label">Différence:</span>
                  <span class="balance-value" :class="{ 'balanced': isBalanced, 'unbalanced': !isBalanced }">
                    {{ formatCurrency(Math.abs(totalDebit - totalCredit)) }}
                  </span>
                </div>
              </div>
              
              <div class="balance-status">
                <div v-if="isBalanced" class="status-balanced">
                  ✅ Écriture équilibrée
                </div>
                <div v-else class="status-unbalanced">
                  ⚠️ Écriture non équilibrée ({{ formatCurrency(Math.abs(totalDebit - totalCredit)) }})
                </div>
              </div>
            </div>

            <!-- Actions du formulaire -->
            <div class="form-actions-main">
              <button 
                type="submit" 
                :disabled="!canSubmit || saving" 
                class="btn btn-primary btn-large"
              >
                <span class="btn-icon">{{ saving ? '⏳' : '💾' }}</span>
                {{ saving ? 'Enregistrement...' : 'Enregistrer l\'écriture' }}
              </button>
              
              <button type="button" @click="resetForm" class="btn btn-secondary" :disabled="saving">
                <span class="btn-icon">🔄</span>
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Journal des Écritures -->
      <div class="journal-section">
        <div class="section-card">
          <div class="section-header">
            <h2>📚 Journal des Écritures ({{ entries.length }} journaux)</h2>
            <div class="journal-filters">
              <input 
                v-model="filterReference" 
                type="text" 
                class="form-input"
                placeholder="Rechercher par référence..."
              >
              
              <input 
                v-model="filterDate" 
                type="date" 
                class="form-input"
                placeholder="Filtrer par date"
              >
            </div>
          </div>

          <div class="journal-table-container">
            <table class="journal-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Référence</th>
                  <th>Description</th>
                  <th>Compte</th>
                  <th>Libellé Ligne</th>
                  <th>Débit</th>
                  <th>Crédit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="entry in filteredEntries" :key="entry.id">
                  <tr v-for="(line, lineIndex) in entry.lines" :key="`${entry.id}-${lineIndex}`" class="journal-row">
                    <td v-if="lineIndex === 0" :rowspan="entry.lines.length" class="date-cell">
                      {{ formatDate(entry.dateDoc) }}
                    </td>
                    <td v-if="lineIndex === 0" :rowspan="entry.lines.length" class="ref-cell">
                      {{ entry.documentNo }}
                    </td>
                    <td v-if="lineIndex === 0" :rowspan="entry.lines.length" class="desc-cell">
                      {{ entry.description }}
                    </td>
                    <td class="account-cell">
                      <span class="account-code">{{ getAccountValue(line.accountId) }}</span>
                      <span class="account-name">{{ getAccountName(line.accountId) }}</span>
                    </td>
                    <td class="libelle-cell">{{ line.description }}</td>
                    <td class="amount-cell debit">
                      {{ line.amtAcctDr ? formatCurrency(line.amtAcctDr) : '' }}
                    </td>
                    <td class="amount-cell credit">
                      {{ line.amtAcctCr ? formatCurrency(line.amtAcctCr) : '' }}
                    </td>
                    <td v-if="lineIndex === 0" :rowspan="entry.lines.length" class="actions-cell">
                      <button @click="viewEntry(entry)" class="btn-icon-small" title="Voir">👁️</button>
                      <button @click="deleteEntry(entry)" class="btn-icon-small" title="Supprimer" :disabled="saving">🗑️</button>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
            
            <div v-if="filteredEntries.length === 0" class="empty-state">
              <p>Aucune écriture trouvée</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import * as fonction from '../js/fonction.js';

export default {
  name: 'AccountingEntries',
  data() {
    return {
      loading: false,
      saving: false,
      loadingMessage: '',
      message: '',
      isError: false,
      
      showPlanComptable: false,
      showAddAccountForm: false,
      accountsSearch: '',
      filterReference: '',
      filterDate: '',
      
      // Configuration
      config: {
        orgId: 11,
        clientId: 11,
        elementId: 105,
        docTypeId: 115,
        glCategoryId: 108,
        currencyId: 100,
        periodId: null
      },
      
      // Plan de comptes (depuis iDempiere)
      comptes: [],
      
      // Nouveau compte
      newAccount: {
        numero: '',
        libelle: '',
        type: ''
      },
      
      accountValidation: {
        error: null
      },
      
      // Nouvelle écriture
      newEntry: {
        date: new Date().toISOString().split('T')[0],
        reference: '',
        description: '',
        lines: [
          { compte: '', debit: null, credit: null, description: '' },
          { compte: '', debit: null, credit: null, description: '' }
        ]
      },
      
      // Journal des écritures (depuis iDempiere)
      entries: [],
      nextEntryId: 1
    }
  },
  
  computed: {
    nextReference() {
      const date = new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const count = this.entries.length + 1;
      return `OD${year}${month}${count.toString().padStart(3, '0')}`;
    },
    
    filteredComptes() {
      if (!this.accountsSearch) return this.comptes;
      const search = this.accountsSearch.toLowerCase();
      return this.comptes.filter(compte => 
        compte.value.toLowerCase().includes(search) ||
        compte.name.toLowerCase().includes(search)
      );
    },
    
    canAddAccount() {
      return this.newAccount.numero && 
            this.newAccount.libelle && 
            this.newAccount.type &&
            !this.accountValidation.error;
    },
    
    totalDebit() {
      return this.newEntry.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    },
    
    totalCredit() {
      return this.newEntry.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    },
    
    isBalanced() {
      return Math.abs(this.totalDebit - this.totalCredit) < 0.01;
    },
    
    canSubmit() {
      return this.isBalanced && 
            this.newEntry.date && 
            this.newEntry.reference &&
            this.newEntry.lines.every(line => line.compte && (line.debit || line.credit)) &&
            !this.saving;
    },
    
    filteredEntries() {
      let filtered = [...this.entries];
      
      if (this.filterReference) {
        const search = this.filterReference.toLowerCase();
        filtered = filtered.filter(entry => 
          entry.documentNo.toLowerCase().includes(search) ||
          entry.description.toLowerCase().includes(search)
        );
      }
      
      if (this.filterDate) {
        filtered = filtered.filter(entry => entry.dateDoc === this.filterDate);
      }
      
      return filtered.sort((a, b) => new Date(b.dateDoc) - new Date(a.dateDoc));
    }
  },
  
  async mounted() {
    await this.loadInitialData();
  },
  
  methods: {
    async loadInitialData() {
      this.loading = true;
      this.loadingMessage = 'Chargement des données...';
      
      try {
        // Charger les données de base
        await this.loadComptes();
        await this.loadCurrentPeriod();
        await this.loadEntries();
        
        this.newEntry.reference = this.nextReference;
        
        // Afficher un résumé des données chargées
        console.log(`📊 Résumé des données chargées:`);
        console.log(`  - Comptes: ${this.comptes.length}`);
        console.log(`  - Écritures: ${this.entries.length}`);
        console.log(`  - Période ID: ${this.config.periodId || 'Non définie'}`);
        
        if (this.comptes.length === 0) {
          this.showError('Aucun compte comptable trouvé. Vérifiez votre configuration ou créez des comptes via l\'import CSV.');
        } else {
          this.showSuccess(`Données chargées: ${this.comptes.length} comptes, ${this.entries.length} écritures`);
        }
        
      } catch (error) {
        console.error('Erreur globale lors du chargement:', error);
        this.showError('Erreur lors du chargement des données: ' + error.message);
      } finally {
        this.loading = false;
      }
    },
    
    async loadComptes() {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      try {
        this.loadingMessage = 'Chargement du plan de comptes...';
        
        // Récupérer tous les comptes pour l'élément spécifié
        const response = await fonction.getIDempiereModelsWhereSelect(
          token,
          'c_elementvalue',
          'C_Element_ID',
          this.config.elementId,
          'C_ElementValue_ID,Value,Name,AccountType,IsActive'
        );
        
        console.log('🔍 Réponse API comptes:', response);
        
        if (response && response.records) {
          console.log('📋 Premier compte brut:', response.records[0]);
          
          this.comptes = response.records
            .filter(compte => compte.isActive !== false) // Garder les actifs et undefined
            .map(compte => {
              // Debug du mapping
              console.log('🔧 Mapping compte:', {
                original: compte,
                mapped: {
                  id: compte.id || compte.C_ElementValue_ID || compte['c_elementvalue_id'],
                  value: compte.value || compte.Value || '',
                  name: compte.name || compte.Name || '',
                  accountType: compte.accountType || compte.AccountType || 'A'
                }
              });
              
              return {
                id: compte.id || compte.C_ElementValue_ID || compte['c_elementvalue_id'],
                value: compte.value || compte.Value || '',
                name: compte.name || compte.Name || '',
                accountType: compte.accountType || compte.AccountType || 'A'
              };
            })
            .sort((a, b) => a.value.localeCompare(b.value));
          
          console.log(`✅ ${this.comptes.length} comptes mappés:`, this.comptes);
        } else {
          console.warn('Aucun compte trouvé dans la réponse');
          this.comptes = [];
        }
      } catch (error) {
        console.error('Erreur chargement comptes:', error);
        this.comptes = [];
        // Ne pas relancer l'erreur pour permettre de continuer
      }
    },
    
    async loadEntries() {
      const token = sessionStorage.getItem('authToken');
      if (!token) return;
      
      try {
        this.loadingMessage = 'Chargement des écritures...';
        
        // Charger les journaux GL pour l'organisation
        const journalsResponse = await fonction.getIDempiereModelsWhereSelect(
          token,
          'gl_journal',
          'AD_Org_ID',
          this.config.orgId,
          'GL_Journal_ID,DocumentNo,DateDoc,Description,DocStatus'
        );
        
        if (journalsResponse && journalsResponse.records) {
          console.log('🔍 Premier journal brut:', journalsResponse.records[0]);
          
          const journals = journalsResponse.records
            .filter(journal => journal.docStatus !== 'VO') // Pas les annulés
            .map(journal => ({
              ...journal,
              // Normaliser la date selon différents formats possibles
              dateDoc: journal.dateDoc || journal.DateDoc || journal.datedoc || new Date().toISOString().split('T')[0]
            }))
            .sort((a, b) => new Date(b.dateDoc) - new Date(a.dateDoc));
          
          console.log(`📚 ${journals.length} journaux trouvés`);
          console.log('📅 Premier journal après mapping:', journals[0]);
          
          // Charger les lignes pour chaque journal
          for (const journal of journals) {
            try {
              const linesResponse = await fonction.getIDempiereModelsWhereSelect(
                token,
                'gl_journalline',
                'GL_Journal_ID',
                journal.id,
                'GL_JournalLine_ID,Account_ID,AmtAcctDr,AmtAcctCr,Description,Line'
              );
              
              if (linesResponse && linesResponse.records) {
                journal.lines = linesResponse.records
                  .map(line => {
                    // Extraire l'ID du compte depuis l'objet complexe
                    let extractedAccountId = line.accountId || line.account_ID || line.Account_ID;
                    
                    // Si c'est un objet complexe, extraire l'ID
                    if (typeof extractedAccountId === 'object' && extractedAccountId !== null) {
                      extractedAccountId = extractedAccountId.id || extractedAccountId;
                    }
                    
                    return {
                      id: line.id,
                      accountId: line.accountId || line.account_ID || line.Account_ID, // Garder l'objet original pour l'affichage
                      amtAcctDr: parseFloat(line.amtAcctDr || line.AmtAcctDr) || 0,
                      amtAcctCr: parseFloat(line.amtAcctCr || line.AmtAcctCr) || 0,
                      description: line.description || line.Description || '',
                      line: line.line || line.Line || 0
                    };
                  })
                  .sort((a, b) => a.line - b.line);
              } else {
                journal.lines = [];
              }
            } catch (lineError) {
              console.warn(`Erreur chargement lignes journal ${journal.id}:`, lineError);
              journal.lines = [];
            }
          }
          
          this.entries = journals;
          console.log(`✅ ${this.entries.length} écritures chargées`);
          console.log('📋 Première écriture complète:', this.entries[0]);
        } else {
          this.entries = [];
        }
      } catch (error) {
        console.error('Erreur chargement écritures:', error);
        this.entries = [];
        // Ne pas relancer l'erreur
      }
    },
    
    async loadCurrentPeriod() {
      const token = sessionStorage.getItem('authToken');
      if (!token) return;
      
      try {
        // Essayer de trouver la période actuelle par nom
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const monthName = currentDate.toLocaleDateString('en-US', { month: 'short' });
        const yearShort = year.toString().slice(-2);
        
        // Format: Jun-25, Jun-2025, 06-2025, etc.
        const periodNames = [
          `${monthName}-${yearShort}`,
          `${monthName}-${year}`,
          `${month.toString().padStart(2, '0')}-${year}`,
          `${year}-${month.toString().padStart(2, '0')}`
        ];
        
        for (const periodName of periodNames) {
          try {
            const response = await fonction.getIDempiereModelsWhereSelect(
              token,
              'c_period',
              'Name',
              `'${periodName}'`,
              'C_Period_ID,Name'
            );
            
            if (response && response.records && response.records.length > 0) {
              this.config.periodId = response.records[0].id;
              console.log(`✅ Période trouvée: ${periodName} (ID: ${this.config.periodId})`);
              return;
            }
          } catch (err) {
            console.log(`Période ${periodName} non trouvée`);
            continue;
          }
        }
        
        // Si aucune période trouvée, essayer de récupérer une période par défaut
        try {
          const allPeriodsResponse = await fonction.getIDempiereModelsWhereSelect(
            token,
            'c_period',
            'IsActive',
            true,
            'C_Period_ID,Name'
          );
          
          if (allPeriodsResponse && allPeriodsResponse.records && allPeriodsResponse.records.length > 0) {
            this.config.periodId = allPeriodsResponse.records[0].id;
            console.log(`⚠️ Utilisation de la période par défaut: ${allPeriodsResponse.records[0].name}`);
          }
        } catch (defaultError) {
          console.warn('Aucune période trouvée, les écritures utiliseront une recherche dynamique');
          this.config.periodId = null;
        }
        
      } catch (error) {
        console.error('Erreur chargement période:', error);
        this.config.periodId = null;
      }
    },
    
    async refreshData() {
      await this.loadInitialData();
      this.showSuccess('Données actualisées avec succès');
    },
    
    // Gestion du plan de comptes
    validateAccountNumber() {
      const numero = this.newAccount.numero;
      this.accountValidation.error = null;
      
      if (numero && !/^\d{3,6}$/.test(numero)) {
        this.accountValidation.error = 'Le numéro doit contenir 3 à 6 chiffres';
        return;
      }
      
      if (numero && this.comptes.some(c => c.value === numero)) {
        this.accountValidation.error = 'Ce numéro de compte existe déjà';
        return;
      }
      
      // Auto-détection du type selon le plan comptable français
      if (numero) {
        const firstDigit = numero.charAt(0);
        if (firstDigit === '1' || firstDigit === '2' || firstDigit === '3' || firstDigit === '5') {
          this.newAccount.type = 'A';
        } else if (firstDigit === '4') {
          this.newAccount.type = 'L';
        } else if (firstDigit === '6') {
          this.newAccount.type = 'E';
        } else if (firstDigit === '7') {
          this.newAccount.type = 'R';
        }
      }
    },
    
    async addAccount() {
      if (!this.canAddAccount || this.saving) return;
      
      this.saving = true;
      const token = sessionStorage.getItem('authToken');
      
      try {
        const accountData = {
          AD_Org_ID: { id: this.config.orgId },
          AD_Client_ID: { id: this.config.clientId },
          isActive: true,
          C_Element_ID: { id: this.config.elementId },
          Value: this.newAccount.numero,
          Name: this.newAccount.libelle,
          AccountType: this.newAccount.type,
          AccountSign: "N",
          IsSummary: false
        };
        
        const result = await fonction.creationtable(token, 'c_elementvalue', accountData);
        
        if (result && result.id) {
          // Ajouter le nouveau compte à la liste locale
          this.comptes.push({
            id: result.id,
            value: this.newAccount.numero,
            name: this.newAccount.libelle,
            accountType: this.newAccount.type
          });
          
          // Trier les comptes
          this.comptes.sort((a, b) => a.value.localeCompare(b.value));
          
          this.showSuccess(`Compte ${this.newAccount.numero} créé avec succès`);
          this.cancelAddAccount();
        }
      } catch (error) {
        this.showError('Erreur lors de la création du compte: ' + error.message);
      } finally {
        this.saving = false;
      }
    },
    
    cancelAddAccount() {
      this.newAccount = { numero: '', libelle: '', type: '' };
      this.accountValidation.error = null;
      this.showAddAccountForm = false;
    },
    
    selectAccount(compte) {
      // Ajouter le compte à la première ligne vide
      const emptyLine = this.newEntry.lines.find(line => !line.compte);
      if (emptyLine) {
        emptyLine.compte = compte.id;
        if (!emptyLine.description) {
          emptyLine.description = compte.name;
        }
      }
    },
    
    async deleteAccount(compte) {
      if (!confirm(`Supprimer le compte ${compte.value} - ${compte.name} ?`)) {
        return;
      }
      
      this.saving = true;
      const token = sessionStorage.getItem('authToken');
      
      try {
        await fonction.deleteRecord(token, 'c_elementvalue', compte.id);
        this.comptes = this.comptes.filter(c => c.id !== compte.id);
        this.showSuccess('Compte supprimé avec succès');
      } catch (error) {
        this.showError('Erreur lors de la suppression: ' + error.message);
      } finally {
        this.saving = false;
      }
    },
    
    getAccountTypeClass(type) {
      const classes = {
        'A': 'type-actif',
        'L': 'type-passif', 
        'E': 'type-charge',
        'R': 'type-produit'
      };
      return classes[type] || '';
    },
    
    getAccountTypeLabel(type) {
      const labels = {
        'A': 'Actif',
        'L': 'Passif',
        'E': 'Charge', 
        'R': 'Produit'
      };
      return labels[type] || '';
    },
    
    // Gestion des écritures
    addLine() {
      this.newEntry.lines.push({
        compte: '',
        debit: null,
        credit: null,
        description: ''
      });
    },
    
    removeLine(index) {
      if (this.newEntry.lines.length > 2) {
        this.newEntry.lines.splice(index, 1);
      }
    },
    
    onAccountSelect(line, index) {
      // Auto-complétion de la description si vide
      if (!line.description && line.compte) {
        const compte = this.comptes.find(c => c.id === line.compte);
        if (compte) {
          line.description = compte.name;
        }
      }
    },
    
    onAmountChange(index, type) {
      const line = this.newEntry.lines[index];
      
      // Si on saisit un débit, vider le crédit et vice versa
      if (type === 'debit' && line.debit) {
        line.credit = null;
      } else if (type === 'credit' && line.credit) {
        line.debit = null;
      }
    },
    
    async addEntry() {
      if (!this.canSubmit || this.saving) return;
      
      this.saving = true;
      const token = sessionStorage.getItem('authToken');
      
      try {
        // 1. Créer le journal GL avec une gestion de date simplifiée
        console.log('🔍 Date originale:', this.newEntry.date);
        
        // Formater la date directement pour iDempiere (YYYY-MM-DD)
        const dateFormatted = this.newEntry.date; // Déjà au bon format depuis input[type="date"]
        console.log('📅 Date formatée:', dateFormatted);
        
        // Rechercher la période comptable avec une méthode plus robuste
        let periodResponse = null;
        
        // Méthode 1: Essayer par date exacte si on a une période définie
        if (this.config.periodId) {
          periodResponse = { records: [{ id: this.config.periodId }] };
        } else {
          // Méthode 2: Rechercher par nom de période
          const currentDate = new Date(this.newEntry.date);
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth() + 1;
          const monthName = currentDate.toLocaleDateString('en-US', { month: 'short' });
          const yearShort = year.toString().slice(-2);
          
          const periodNames = [
            `${monthName}-${yearShort}`,
            `${monthName}-${year}`,
            `${month.toString().padStart(2, '0')}-${year}`
          ];
          
          for (const periodName of periodNames) {
            try {
              periodResponse = await fonction.getIDempiereModelsWhereSelect(
                token,
                'c_period',
                'Name',
                `'${periodName}'`,
                'c_period_id'
              );
              
              if (periodResponse && periodResponse.records && periodResponse.records.length > 0) {
                console.log(`📅 Période trouvée: ${periodName}`);
                break;
              }
            } catch (err) {
              console.log(`Période ${periodName} non trouvée, essai suivant...`);
              continue;
            }
          }
        }
        
        if (!periodResponse || !periodResponse.records || periodResponse.records.length === 0) {
          throw new Error(`Aucune période comptable trouvée pour la date ${this.newEntry.date}. Veuillez vérifier votre calendrier comptable.`);
        }
        
        console.log('📅 Période utilisée:', periodResponse.records[0]);
        
        const journalData = {
          AD_Org_ID: { id: this.config.orgId },
          AD_Client_ID: { id: this.config.clientId },
          C_DocType_ID: { id: this.config.docTypeId },
          DocumentNo: this.newEntry.reference,
          DateDoc: dateFormatted,
          DateAcct: dateFormatted,
          C_Period_ID: { id: periodResponse.records[0].id },
          Description: this.newEntry.description || this.newEntry.reference,
          C_Currency_ID: { id: this.config.currencyId },
          GL_Category_ID: { id: this.config.glCategoryId },
          DocStatus: 'DR',
          IsActive: true
        };
        
        console.log('📝 Données du journal à créer:', journalData);
        
        const journalResult = await fonction.creationtable(token, 'gl_journal', journalData);
        
        if (!journalResult || !journalResult.id) {
          throw new Error('Erreur lors de la création du journal');
        }
        
        console.log('✅ Journal créé avec ID:', journalResult.id);
        
        // 2. Créer les lignes d'écriture
        const journalId = journalResult.id;
        const createdLines = [];
        
        for (let i = 0; i < this.newEntry.lines.length; i++) {
          const line = this.newEntry.lines[i];
          
          if (!line.compte || (!line.debit && !line.credit)) {
            console.log(`⚠️ Ligne ${i + 1} ignorée - compte ou montant manquant`);
            continue; // Ignorer les lignes vides
          }
          
          const lineData = {
            GL_Journal_ID: { id: journalId },
            Account_ID: { id: line.compte },
            AmtSourceDr: parseFloat(line.debit) || 0,
            AmtSourceCr: parseFloat(line.credit) || 0,
            AmtAcctDr: parseFloat(line.debit) || 0,
            AmtAcctCr: parseFloat(line.credit) || 0,
            C_Currency_ID: { id: this.config.currencyId },
            DateAcct: dateFormatted,
            Description: line.description || '',
            Line: (i + 1) * 10
          };
          
          console.log(`📝 Ligne ${i + 1} à créer:`, lineData);
          
          const lineResult = await fonction.creationtable(token, 'gl_journalline', lineData);
          
          if (lineResult && lineResult.id) {
            createdLines.push({
              id: lineResult.id,
              accountId: line.compte,
              amtAcctDr: parseFloat(line.debit) || 0,
              amtAcctCr: parseFloat(line.credit) || 0,
              description: line.description || '',
              line: (i + 1) * 10
            });
            console.log(`✅ Ligne ${i + 1} créée avec ID:`, lineResult.id);
          }
        }
        
        // 3. Ajouter l'écriture à la liste locale
        const newJournalEntry = {
          id: journalId,
          documentNo: this.newEntry.reference,
          dateDoc: this.newEntry.date,
          description: this.newEntry.description || this.newEntry.reference,
          docStatus: 'DR',
          lines: createdLines
        };
        
        this.entries.unshift(newJournalEntry);
        
        this.showSuccess(`Écriture ${this.newEntry.reference} créée avec succès ! (${createdLines.length} lignes)`);
        this.resetForm();
        
      } catch (error) {
        console.error('Erreur création écriture:', error);
        this.showError('Erreur lors de la création de l\'écriture: ' + error.message);
      } finally {
        this.saving = false;
      }
    },
    
    resetForm() {
      this.newEntry = {
        date: new Date().toISOString().split('T')[0],
        reference: this.nextReference,
        description: '',
        lines: [
          { compte: '', debit: null, credit: null, description: '' },
          { compte: '', debit: null, credit: null, description: '' }
        ]
      };
    },
    
    viewEntry(entry) {
      // Afficher les détails de l'écriture
      const totalDebit = entry.lines.reduce((sum, line) => sum + line.amtAcctDr, 0);
      const totalCredit = entry.lines.reduce((sum, line) => sum + line.amtAcctCr, 0);
      
      let details = `Écriture: ${entry.documentNo}\n`;
      details += `Date: ${this.formatDate(entry.dateDoc)}\n`;
      details += `Description: ${entry.description}\n\n`;
      details += `Lignes:\n`;
      
      entry.lines.forEach((line, index) => {
        const account = this.getAccountValue(line.accountId);
        const name = this.getAccountName(line.accountId);
        details += `${index + 1}. ${account} - ${name}\n`;
        if (line.amtAcctDr > 0) details += `   Débit: ${this.formatCurrency(line.amtAcctDr)}\n`;
        if (line.amtAcctCr > 0) details += `   Crédit: ${this.formatCurrency(line.amtAcctCr)}\n`;
        if (line.description) details += `   Description: ${line.description}\n`;
        details += `\n`;
      });
      
      details += `Total Débit: ${this.formatCurrency(totalDebit)}\n`;
      details += `Total Crédit: ${this.formatCurrency(totalCredit)}`;
      
      alert(details);
    },
    
    async deleteEntry(entry) {
      if (!confirm(`Supprimer l'écriture ${entry.documentNo} ?`)) {
        return;
      }
      
      this.saving = true;
      const token = sessionStorage.getItem('authToken');
      
      try {
        // Supprimer d'abord les lignes
        for (const line of entry.lines) {
          await fonction.deleteRecord(token, 'gl_journalline', line.id);
        }
        
        // Puis supprimer le journal
        await fonction.deleteRecord(token, 'gl_journal', entry.id);
        
        // Retirer de la liste locale
        this.entries = this.entries.filter(e => e.id !== entry.id);
        
        this.showSuccess('Écriture supprimée avec succès');
      } catch (error) {
        this.showError('Erreur lors de la suppression: ' + error.message);
      } finally {
        this.saving = false;
      }
    },
    
    getAccountValue(accountId) {
      // Si accountId est un objet JSON complexe
      if (typeof accountId === 'object' && accountId !== null) {
        if (accountId.identifier) {
          // Extraire le code depuis l'identifier (format: "51200_Banque")
          const parts = accountId.identifier.split('_');
          return parts[0] || accountId.id;
        }
        return accountId.id || 'N/A';
      }
      
      // Si c'est un ID simple, chercher dans les comptes
      const compte = this.comptes.find(c => c.id === accountId);
      return compte ? compte.value : accountId;
    },
    
    getAccountName(accountId) {
      // Si accountId est un objet JSON complexe
      if (typeof accountId === 'object' && accountId !== null) {
        if (accountId.identifier) {
          // Extraire le nom depuis l'identifier (format: "51200_Banque")
          const parts = accountId.identifier.split('_');
          return parts.slice(1).join('_') || 'Compte inconnu';
        }
        return 'Compte inconnu';
      }
      
      // Si c'est un ID simple, chercher dans les comptes
      const compte = this.comptes.find(c => c.id === accountId);
      return compte ? compte.name : '';
    },
    
    // Utilitaires
    formatDate(date) {
      if (!date) return 'Date inconnue';
      
      try {
        // Gérer différents formats de date
        let dateObj;
        
        if (typeof date === 'string') {
          // Si c'est déjà au format YYYY-MM-DD
          if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            dateObj = new Date(date + 'T00:00:00');
          }
          // Si c'est un timestamp ou autre format
          else {
            dateObj = new Date(date);
          }
        } else {
          dateObj = new Date(date);
        }
        
        // Vérifier si la date est valide
        if (isNaN(dateObj.getTime())) {
          console.warn('Date invalide:', date);
          return 'Date invalide';
        }
        
        return dateObj.toLocaleDateString('fr-FR');
      } catch (error) {
        console.error('Erreur formatage date:', error, 'Date originale:', date);
        return 'Erreur date';
      }
    },
    
    formatCurrency(amount) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    },
    
    showSuccess(message) {
      this.message = message;
      this.isError = false;
      setTimeout(() => {
        this.message = '';
      }, 5000);
    },
    
    showError(message) {
      this.message = message;
      this.isError = true;
      setTimeout(() => {
        this.message = '';
      }, 8000);
    },
    
    exportData() {
      // Export des données comptables
      const data = {
        exportDate: new Date().toISOString(),
        comptes: this.comptes.map(c => ({
          numero: c.value,
          libelle: c.name,
          type: c.accountType
        })),
        ecritures: this.entries.map(e => ({
          date: e.dateDoc,
          reference: e.documentNo,
          description: e.description,
          lines: e.lines.map(l => ({
            compte: this.getAccountValue(l.accountId),
            libelle: this.getAccountName(l.accountId),
            description: l.description,
            debit: l.amtAcctDr,
            credit: l.amtAcctCr
          }))
        })),
        totaux: {
          nombreComptes: this.comptes.length,
          nombreEcritures: this.entries.length,
          nombreLignes: this.entries.reduce((sum, e) => sum + e.lines.length, 0)
        }
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comptabilite-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      this.showSuccess('Export réalisé avec succès');
    }
  }
}
</script>

<style scoped>
.accounting-entries-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
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

/* Message Alert */
.message-alert {
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-left: 4px solid #10b981;
  animation: slideIn 0.3s ease-out;
}

.error-message {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-left: 4px solid #ef4444;
}

/* Header */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.header-title h1 {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.title-icon {
  font-size: 2rem;
}

.subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Buttons */
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

.btn-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1rem;
}

.btn-icon-small {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn-icon-small:hover:not(:disabled) {
  background: #f3f4f6;
  transform: scale(1.1);
}

.btn-icon-small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Page Content */
.page-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Section Cards */
.section-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

/* Plan de Comptes */
.add-account-form {
  background: #f8fafc;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.form-input, .form-select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled, .form-select:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.error-text {
  color: #ef4444;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Comptes List */
.accounts-search {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
}

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.account-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.account-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.account-number {
  font-weight: 700;
  color: #1f2937;
  font-family: 'Monaco', 'Consolas', monospace;
}

.account-type {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.type-actif { background: #dbeafe; color: #1e40af; }
.type-passif { background: #fef3c7; color: #92400e; }
.type-charge { background: #fecaca; color: #dc2626; }
.type-produit { background: #d1fae5; color: #065f46; }

.account-name {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.account-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Entry Form */
.entry-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-info {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.info-item {
  font-size: 0.9rem;
  color: #6b7280;
}

.entry-header {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

/* Entry Lines */
.entry-lines h3 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1.25rem;
}

.lines-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.entry-line {
  display: flex;
  gap: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.entry-line:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.line-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.line-content {
  flex: 1;
}

.line-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr auto;
  gap: 1rem;
  align-items: end;
}

.amount-input {
  text-align: right;
  font-family: 'Monaco', 'Consolas', monospace;
}

.line-actions {
  display: flex;
  align-items: center;
}

.remove-btn {
  color: #ef4444;
}

.add-line-btn {
  align-self: flex-start;
}

/* Balance */
.entry-balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 1rem;
}

.balance-info {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.balance-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
}

.balance-label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
}

.balance-value {
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'Monaco', 'Consolas', monospace;
}

.balance-value.debit { color: #ef4444; }
.balance-value.credit { color: #10b981; }
.balance-value.balanced { color: #10b981; }
.balance-value.unbalanced { color: #ef4444; }

.balance-status {
  display: flex;
  align-items: center;
}

.status-balanced {
  color: #10b981;
  font-weight: 600;
  padding: 0.5rem 1rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
}

.status-unbalanced {
  color: #ef4444;
  font-weight: 600;
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
}

.form-actions-main {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* Journal */
.journal-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.journal-table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.journal-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.journal-table th {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.journal-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.9rem;
}

.journal-row:hover {
  background: #f8fafc;
}

.date-cell, .ref-cell, .desc-cell {
  border-right: 1px solid #e5e7eb;
  font-weight: 600;
}

.account-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.account-code {
  font-weight: 600;
  font-family: 'Monaco', 'Consolas', monospace;
}

.account-name {
  font-size: 0.8rem;
  color: #6b7280;
}

.amount-cell {
  text-align: right;
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 600;
}

.amount-cell.debit {
  color: #ef4444;
}

.amount-cell.credit {
  color: #10b981;
}

.actions-cell {
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .line-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .balance-info {
    justify-content: center;
  }
  
  .entry-balance {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .accounting-entries-page {
    padding: 1rem;
  }
  
  .section-card {
    padding: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .accounts-grid {
    grid-template-columns: 1fr;
  }
  
  .entry-line {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .line-number {
    align-self: flex-start;
  }
  
  .form-actions-main {
    justify-content: stretch;
  }
  
  .form-actions-main .btn {
    flex: 1;
    justify-content: center;
  }
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-card {
  animation: slideIn 0.5s ease-out;
}

.entry-line {
  animation: slideIn 0.3s ease-out;
}

/* Focus states */
.form-input:focus,
.form-select:focus,
.btn:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .page-header,
  .header-actions,
  .btn,
  .add-account-form {
    display: none !important;
  }
  
  .section-card {
    box-shadow: none;
    border: 1px solid #000;
  }
  
  .journal-table {
    font-size: 0.8rem;
  }
}
</style>  