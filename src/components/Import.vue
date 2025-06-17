<template>
  <div class="csv-upload-container">
    <div class="header-section">
      <h1 class="main-title">Importation de fichiers comptables</h1>
      <p class="subtitle">Chargez vos fichiers CSV pour traitement et validation</p>
    </div>

    <!-- Configuration dynamique -->
    <div v-if="showConfig" class="config-section">
      <div class="config-card">
        <h3>🔧 Configuration de l'import</h3>
        
        <div class="config-grid">
          <div class="config-item">
            <label>Organisation ID:</label>
            <input v-model="config.orgId" type="number" placeholder="11" />
          </div>
          <div class="config-item">
            <label>Client ID:</label>
            <input v-model="config.clientId" type="number" placeholder="11" />
          </div>
          <div class="config-item">
            <label>Element ID:</label>
            <input v-model="config.elementId" type="number" placeholder="105" />
          </div>
        </div>

        <div class="mapping-section">
          <h4>📊 Mapping des colonnes - Fichier écritures</h4>
          <div class="mapping-grid">
            <div class="mapping-item">
              <label>Colonne Date:</label>
              <select v-model="columnMapping.date">
                <option value="">-- Sélectionner --</option>
                <option v-for="col in availableColumns1" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
            <div class="mapping-item">
              <label>Colonne Référence:</label>
              <select v-model="columnMapping.reference">
                <option value="">-- Sélectionner --</option>
                <option v-for="col in availableColumns1" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
            <div class="mapping-item">
              <label>Colonne Compte:</label>
              <select v-model="columnMapping.compte">
                <option value="">-- Sélectionner --</option>
                <option v-for="col in availableColumns1" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
            <div class="mapping-item">
              <label>Colonne Débit:</label>
              <select v-model="columnMapping.debit">
                <option value="">-- Sélectionner --</option>
                <option v-for="col in availableColumns1" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
            <div class="mapping-item">
              <label>Colonne Crédit:</label>
              <select v-model="columnMapping.credit">
                <option value="">-- Sélectionner --</option>
                <option v-for="col in availableColumns1" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>

          <h4>🏦 Mapping des colonnes - Fichier comptes</h4>
          <div class="mapping-grid">
            <div class="mapping-item">
              <label>Colonne Numéro de compte:</label>
              <select v-model="columnMapping.compteNum">
                <option value="">-- Sélectionner --</option>
                <option v-for="col in availableColumns2" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
            <div class="mapping-item">
              <label>Colonne Libellé:</label>
              <select v-model="columnMapping.libelle">
                <option value="">-- Sélectionner --</option>
                <option v-for="col in availableColumns2" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="date-format-section">
          <h4>📅 Format de date</h4>
          <select v-model="config.dateFormat">
            <option value="DD/MM/YYYY">DD/MM/YYYY (01/06/2025)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (06/01/2025)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (2025-06-01)</option>
            <option value="DD-MM-YYYY">DD-MM-YYYY (01-06-2025)</option>
            <option value="auto">Détection automatique</option>
          </select>
        </div>

        <button @click="saveConfig" class="config-save-btn">💾 Sauvegarder la configuration</button>
      </div>
    </div>

    <div class="upload-section">
      <div class="file-upload-card">
        <div class="config-toggle">
          <button @click="showConfig = !showConfig" class="config-toggle-btn">
            <i class="fas fa-cog"></i>
            {{ showConfig ? 'Masquer' : 'Afficher' }} la configuration
          </button>
        </div>

        <div class="file-input-group">
          <label class="file-label">
            <i class="fas fa-file-csv icon"></i>
            <span>Fichier des écritures comptables</span>
            <input type="file" @change="handleFileChange1" accept=".csv" class="file-input" />
          </label>
          <small v-if="availableColumns1.length" class="column-preview">
            Colonnes détectées: {{ availableColumns1.join(', ') }}
          </small>
        </div>

        <div class="file-input-group">
          <label class="file-label">
            <i class="fas fa-file-csv icon"></i>
            <span>Fichier des comptes</span>
            <input type="file" @change="handleFileChange2" accept=".csv" class="file-input" />
          </label>
          <small v-if="availableColumns2.length" class="column-preview">
            Colonnes détectées: {{ availableColumns2.join(', ') }}
          </small>
        </div>

        <!-- Validation du mapping -->
        <div v-if="mappingErrors.length" class="mapping-validation">
          <h4>⚠️ Erreurs de configuration:</h4>
          <ul>
            <li v-for="error in mappingErrors" :key="error" class="error-item">{{ error }}</li>
          </ul>
        </div>

        <button @click="valider" class="validate-button" :disabled="!isMappingValid">
          <i class="fas fa-check-circle button-icon">Valider et importer tout</i>
        </button>

        <button @click="createBusinessPartnersNow" class="validate-button" style="background-color: #28a745; margin-top: 1rem;" :disabled="!csvData2.length">
          <i class="fas fa-users button-icon"></i>
          Créer les Business Partners uniquement
        </button>
      </div>

      <div v-if="message" class="message-alert" :class="{ 'error-message': !message.includes('succès') && !message.includes('✅') }">
        <i class="fas" :class="message.includes('succès') || message.includes('✅') ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
        {{ message }}
      </div>
    </div>

    <div v-if="csvData1.length" class="data-section">
      <div class="data-card">
        <h2 class="data-title">
          <i class="fas fa-table"></i>
          Contenu du fichier des écritures
        </h2>
        <div class="table-wrapper">
          <table class="styled-table">
            <thead>
              <tr>
                <th v-for="(header, index) in Object.keys(csvData1[0])" :key="'header-' + index">{{ header }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in csvData1.slice(0, 5)" :key="'row-' + rowIndex">
                <td v-for="(value, key) in row" :key="'cell-' + key">{{ value }}</td>
              </tr>
              <tr v-if="csvData1.length > 5">
                <td :colspan="Object.keys(csvData1[0]).length" class="more-items">
                  + {{ csvData1.length - 5 }} autres écritures...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="detectedBPartners.length" class="references-section">
      <div class="references-card">
        <h2 class="references-title">
          <i class="fas fa-users"></i>
          Business Partners détectés
        </h2>
        <div class="references-grid">
          <div v-for="(bp, index) in detectedBPartners" :key="'bp-' + index" class="reference-item" :style="getStatusStyle(bp.status)">
            <span class="reference-number">
              <i :class="bp.type === 'client' ? 'fas fa-user' : 'fas fa-building'"></i>
            </span>
            <div class="reference-details">
              <div class="reference-value">{{ bp.libelle }}</div>
              <div class="reference-date">{{ bp.compte }} - {{ bp.type }} - {{ getStatusText(bp.status) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="action-section">
      <button @click="redirectToPage()" class="action-button">
        <i class="fas fa-book button-icon"></i>
        Consulter le livre de compte
      </button>
    </div>
  </div>
</template>

<script>
import Papa from "papaparse";
import axios from "axios";
import * as fonction from '../js/fonction.js';

export default {
  data() {
    return {
      csvData1: [],
      csvData2: [],
      availableColumns1: [],
      availableColumns2: [],
      uniqueReferences: [],
      detectedBPartners: [],
      message: '',
      showConfig: false,
      
      config: {
        orgId: 11,
        clientId: 11,
        elementId: 105,
        docTypeId: 115,
        glCategoryId: 108,
        currencyId: 100,
        dateFormat: 'DD/MM/YYYY'
      },
      
      columnMapping: {
        date: 'date',
        reference: 'reference',
        compte: 'compte',
        debit: 'debit',
        credit: 'credit',
        compteNum: 'compte',
        libelle: 'libelle'
      }
    };
  },

  computed: {
    mappingErrors() {
      const errors = [];
      
      if (this.csvData1.length > 0) {
        if (!this.columnMapping.date || !this.availableColumns1.includes(this.columnMapping.date)) {
          errors.push('Colonne date manquante ou invalide pour le fichier des écritures');
        }
        if (!this.columnMapping.reference || !this.availableColumns1.includes(this.columnMapping.reference)) {
          errors.push('Colonne référence manquante ou invalide pour le fichier des écritures');
        }
        if (!this.columnMapping.compte || !this.availableColumns1.includes(this.columnMapping.compte)) {
          errors.push('Colonne compte manquante ou invalide pour le fichier des écritures');
        }
      }
      
      if (this.csvData2.length > 0) {
        if (!this.columnMapping.compteNum || !this.availableColumns2.includes(this.columnMapping.compteNum)) {
          errors.push('Colonne numéro de compte manquante ou invalide pour le fichier des comptes');
        }
        if (!this.columnMapping.libelle || !this.availableColumns2.includes(this.columnMapping.libelle)) {
          errors.push('Colonne libellé manquante ou invalide pour le fichier des comptes');
        }
      }
      
      return errors;
    },
    
    isMappingValid() {
      return this.mappingErrors.length === 0 && this.csvData1.length > 0 && this.csvData2.length > 0;
    }
  },

  mounted() {
    this.loadConfig();
  },

  methods: {
    redirectToPage() {
      this.$router.push('/compte');
    },

    saveConfig() {
      localStorage.setItem('import_config', JSON.stringify({
        config: this.config,
        columnMapping: this.columnMapping
      }));
      this.message = '✅ Configuration sauvegardée !';
      setTimeout(() => { 
        this.message = ''; 
      }, 3000);
    },

    loadConfig() {
      const saved = localStorage.getItem('import_config');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.config = { ...this.config, ...parsed.config };
          this.columnMapping = { ...this.columnMapping, ...parsed.columnMapping };
        } catch (e) {
          console.warn('Erreur lors du chargement de la configuration:', e);
        }
      }
    },

    detectColumns(data, fileNumber) {
      if (data.length === 0) return [];
      
      const columns = Object.keys(data[0]).map(col => col.trim());
      
      if (fileNumber === 1) {
        this.availableColumns1 = columns;
        this.autoMapColumns1(columns);
      } else {
        this.availableColumns2 = columns;
        this.autoMapColumns2(columns);
      }
      
      return columns;
    },

    autoMapColumns1(columns) {
      const mapping = {
        date: this.findColumn(columns, ['date', 'datum', 'fecha', 'data']),
        reference: this.findColumn(columns, ['reference', 'ref', 'numero', 'number', 'num']),
        compte: this.findColumn(columns, ['compte', 'account', 'codigo', 'code']),
        debit: this.findColumn(columns, ['debit', 'debe', 'dr', 'doit']),
        credit: this.findColumn(columns, ['credit', 'haber', 'cr', 'avoir'])
      };
      
      Object.keys(mapping).forEach(key => {
        if (mapping[key]) {
          this.columnMapping[key] = mapping[key];
        }
      });
    },

    autoMapColumns2(columns) {
      const mapping = {
        compteNum: this.findColumn(columns, ['compte', 'account', 'numero', 'number', 'code', 'codigo']),
        libelle: this.findColumn(columns, ['libelle', 'label', 'name', 'nom', 'description', 'desc'])
      };
      
      Object.keys(mapping).forEach(key => {
        if (mapping[key]) {
          this.columnMapping[key] = mapping[key];
        }
      });
    },

    findColumn(columns, patterns) {
      for (const pattern of patterns) {
        const found = columns.find(col => 
          col.toLowerCase().includes(pattern.toLowerCase()) ||
          col.toLowerCase().replace(/[^a-z]/g, '').includes(pattern.toLowerCase())
        );
        if (found) return found;
      }
      return null;
    },

    isDateValid(dateStr) {
      if (!dateStr) return false;
      
      const formats = [
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
        /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/
      ];
      
      for (const regex of formats) {
        if (regex.test(dateStr.toString().trim())) {
          try {
            const date = this.parseDate(dateStr);
            return date instanceof Date && !isNaN(date);
          } catch {
            continue;
          }
        }
      }
      
      return false;
    },

    parseDate(dateStr) {
      const str = dateStr.toString().trim();
      
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) {
        return new Date(str);
      }
      
      const ddmmyyyy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (ddmmyyyy) {
        const [, day, month, year] = ddmmyyyy;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      
      if (this.config.dateFormat === 'MM/DD/YYYY') {
        const mmddyyyy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (mmddyyyy) {
          const [, month, day, year] = mmddyyyy;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
      }
      
      return new Date(str);
    },

    handleFileChange1(event) {
      const file = event.target.files[0];
      if (file) {
        Papa.parse(file, {
          complete: (result) => {
            const cleanData = result.data.filter((row, index) => {
              if (!row || Object.values(row).every(val => !val || val.toString().trim() === '')) {
                return false;
              }
              return true;
            });
            
            this.csvData1 = cleanData;
            this.detectColumns(cleanData, 1);
            this.extractUniqueReferences();
            this.analyzeForBPartners();
            
            console.log(`📊 Fichier des écritures: ${cleanData.length} lignes chargées`);
          },
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.replace(/[*"']/g, '').trim(),
          transform: (value) => value ? value.toString().trim() : value
        });
      }
    },
    
    handleFileChange2(event) {
      const file = event.target.files[0];
      if (file) {
        Papa.parse(file, {
          complete: (result) => {
            const cleanData = result.data.filter((row, index) => {
              if (!row || Object.values(row).every(val => !val || val.toString().trim() === '')) {
                return false;
              }
              return true;
            });
            
            this.csvData2 = cleanData;
            this.detectColumns(cleanData, 2);
            this.analyzeForBPartners();
            
            console.log(`📊 Fichier des comptes: ${cleanData.length} lignes chargées`);
          },
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.replace(/[*"']/g, '').trim(),
          transform: (value) => value ? value.toString().trim() : value
        });
      }
    },

    getRowValue(row, mappingKey) {
      const columnName = this.columnMapping[mappingKey];
      return row[columnName];
    },

    getAccountType(accountNumber) {
      const account = accountNumber.toString();
      
      if (account.startsWith('1') || account.startsWith('2') || account.startsWith('3')) {
        return 'A';
      }
      if (account.startsWith('4')) {
        return 'L';
      }
      if (account.startsWith('5')) {
        return 'A';
      }
      if (account.startsWith('6')) {
        return 'E';
      }
      if (account.startsWith('7')) {
        return 'R';
      }
      
      return 'A';
    },

    analyzeForBPartners() {
      if (this.csvData2.length === 0) return;
      this.detectedBPartners = this.analyzeAccountsForBusinessPartners();
    },

    analyzeAccountsForBusinessPartners() {
      const potentialBPartners = [];
      
      this.csvData2.forEach(compteInfo => {
        const compte = this.getRowValue(compteInfo, 'compteNum');
        const libelle = this.getRowValue(compteInfo, 'libelle');
        
        if (!compte || !libelle) {
          return;
        }
        
        const compteStr = compte.toString().trim();
        const libelleStr = libelle.toString().trim();
        
        if (!compteStr || !libelleStr) return;
        
        let isClientFournisseur = false;
        let type = null;
        
        if (compteStr.startsWith('40')) {
          isClientFournisseur = true;
          type = 'fournisseur';
        } else if (compteStr.startsWith('41')) {
          isClientFournisseur = true;
          type = 'client';
        }
        
        if (!isClientFournisseur) {
          const libelleLC = libelleStr.toLowerCase();
          if (libelleLC.includes('client') || libelleLC.includes('débiteur')) {
            isClientFournisseur = true;
            type = 'client';
          } else if (libelleLC.includes('fournisseur') || libelleLC.includes('créancier')) {
            isClientFournisseur = true;
            type = 'fournisseur';
          }
        }
        
        if (isClientFournisseur) {
          potentialBPartners.push({
            compte: compteStr,
            libelle: libelleStr,
            type: type,
            status: 'pending'
          });
        }
      });
      
      return potentialBPartners;
    },

    async createBusinessPartnersFromAccounts() {
      const token = sessionStorage.getItem('authToken');
      const accountsToConvert = this.analyzeAccountsForBusinessPartners();
      
      if (accountsToConvert.length === 0) {
        console.log('ℹ️ Aucun compte client/fournisseur détecté à convertir');
        return [];
      }
      
      console.log(`🏗️ Création de ${accountsToConvert.length} Business Partners...`);
      const createdBPartners = [];
      
      for (const accountInfo of accountsToConvert) {
        try {
          const existingBP = await fonction.getIDempiereModelsWhereSelect(
            token,
            'c_bpartner',
            'Value',
            `'${accountInfo.compte}'`,
            'C_BPartner_ID'
          );
          
          if (existingBP.records && existingBP.records.length > 0) {
            createdBPartners.push({
              id: existingBP.records[0].id,
              compte: accountInfo.compte,
              name: accountInfo.libelle,
              type: accountInfo.type,
              status: 'existing'
            });
            continue;
          }
          
          const bpartnerData = {
            AD_Org_ID: { id: this.config.orgId },
            AD_Client_ID: { id: this.config.clientId },
            Value: accountInfo.compte,
            Name: accountInfo.libelle,
            IsVendor: accountInfo.type === 'fournisseur',
            IsCustomer: accountInfo.type === 'client',
            TaxID: accountInfo.compte,
            Description: `Business Partner créé automatiquement depuis le compte ${accountInfo.compte}`,
            IsActive: true,
            IsSummary: false
          };
          
          const result = await fonction.creationtable(token, 'c_bpartner', bpartnerData);
          
          if (result && result.id) {
            createdBPartners.push({
              id: result.id,
              compte: accountInfo.compte,
              name: accountInfo.libelle,
              type: accountInfo.type,
              status: 'created'
            });
          }
          
        } catch (error) {
          console.error(`❌ Erreur création Business Partner ${accountInfo.compte}:`, error);
        }
      }
      
      return createdBPartners;
    },

    async createBusinessPartnersNow() {
      if (this.csvData2.length === 0) {
        this.message = 'Veuillez d\'abord charger le fichier des comptes';
        return;
      }
      
      try {
        const createdBPartners = await this.createBusinessPartnersFromAccounts();
        
        if (createdBPartners.length > 0) {
          const clients = createdBPartners.filter(bp => bp.type === 'client');
          const fournisseurs = createdBPartners.filter(bp => bp.type === 'fournisseur');
          
          this.message = `✅ Business Partners créés avec succès !\n- ${clients.length} clients\n- ${fournisseurs.length} fournisseurs\nVous pouvez maintenant créer des factures ! 🎉`;
        } else {
          this.message = 'ℹ️ Aucun compte client/fournisseur détecté dans vos données';
        }
        
      } catch (error) {
        this.message = `❌ Erreur lors de la création des Business Partners: ${error.message}`;
      }
    },

    getStatusStyle(status) {
      switch(status) {
        case 'created':
          return { borderLeftColor: '#2ecc71' };
        case 'existing':
          return { borderLeftColor: '#3498db' };
        default:
          return { borderLeftColor: '#f39c12' };
      }
    },

    getStatusText(status) {
      switch(status) {
        case 'created':
          return 'Créé';
        case 'existing':
          return 'Existant';
        default:
          return 'À créer';
      }
    },

    async valider() {
      if (!this.isMappingValid) {
        this.message = "❌ Veuillez corriger les erreurs de configuration avant de continuer";
        return;
      }

      console.log("🚀 Début de l'import avec configuration:", this.config);
      const token = sessionStorage.getItem('authToken');
      let valide = true;
      let ligne = 0;
      
      for (let i = 0; i < this.csvData1.length; i++) {
        const dateValue = this.getRowValue(this.csvData1[i], 'date');
        if (!this.isDateValid(dateValue)) {
          valide = false;
          ligne = i + 2;
          break;
        }
      }

      if (valide) {
        try {
          console.log('📊 ÉTAPE 1: Création des comptes comptables...');
          for (let k = 0; k < this.csvData2.length; k++) {
            try {
              const compte = this.getRowValue(this.csvData2[k], 'compteNum');
              const libelle = this.getRowValue(this.csvData2[k], 'libelle');
              
              if (!compte || !libelle) {
                console.log(`⚠️ Compte ignoré ligne ${k + 1} - données manquantes`);
                continue;
              }
              
              const compteStr = compte.toString().trim();
              const libelleStr = libelle.toString().trim();
              
              if (!compteStr || !libelleStr) continue;
              
              const existingAccount = await fonction.getIDempiereModelsWhereSelect(
                token, 
                'c_elementvalue', 
                'value', 
                `'${compteStr}'`, 
                'C_ElementValue_ID'
              );
              
              if (existingAccount.records && existingAccount.records.length > 0) {
                console.log(`⚠️ Compte ${compteStr} existe déjà`);
              } else {
                const accountType = this.getAccountType(compteStr);
                
                let comptedata = {
                  AD_Org_ID: { id: this.config.orgId },
                  AD_Client_ID: { id: this.config.clientId },
                  isActive: true,
                  C_Element_ID: { id: this.config.elementId },
                  Value: compteStr,
                  Name: libelleStr,
                  AccountType: accountType,
                  AccountSign: "N",
                  IsSummary: false
                };
                
                console.log(`🏦 Création compte ${compteStr} (${libelleStr}) - Type: ${accountType}`);
                await fonction.creationtable(token, 'c_elementvalue', comptedata);
              }
              
            } catch (accountError) {
              console.error(`❌ Erreur avec le compte ligne ${k + 1}:`, accountError);
            }
          }
          
          console.log('\n🤖 ÉTAPE 2: Création automatique des Business Partners...');
          try {
            const createdBPartners = await this.createBusinessPartnersFromAccounts();
            console.log(`✅ ${createdBPartners.length} Business Partners traités`);
          } catch (bpError) {
            console.error('❌ Erreur lors de la création des Business Partners:', bpError);
          }
          
          console.log('\n📝 ÉTAPE 3: Création des journaux...');
          const journalGroups = {};
          
          this.csvData1.forEach(line => {
            const reference = this.getRowValue(line, 'reference');
            if (reference) {
              if (!journalGroups[reference]) {
                journalGroups[reference] = [];
              }
              journalGroups[reference].push(line);
            }
          });
          
          console.log('📊 Groupes de journaux:', Object.keys(journalGroups));
          
          for (const [journalRef, lines] of Object.entries(journalGroups)) {
            try {
              console.log(`\n🏗️ Traitement du journal ${journalRef} avec ${lines.length} lignes`);
              
              const existingJournal = await fonction.getIDempiereModelsWhereSelect(
                token,
                'gl_journal',
                'DocumentNo',
                `'${journalRef}'`,
                'GL_Journal_ID'
              );
              
              let journalId;
              
              if (existingJournal.records && existingJournal.records.length > 0) {
                console.log(`⚠️ Journal ${journalRef} existe déjà - utilisation de l'existant`);
                journalId = existingJournal.records[0].id;
              } else {
                const firstLine = lines[0];
                const dateValue = this.getRowValue(firstLine, 'date');
                let dateformate = fonction.convertirDate(dateValue);
                let debutMois = fonction.getDebutMois(dateformate);
                
                console.log(`🔍 Debug journal ${journalRef}:`);
                console.log(`  Date originale: ${dateValue}`);
                console.log(`  Date formatée: ${dateformate}`);
                
                let riri = await fonction.getIDempiereModelsWhereSelect(token, 'c_period', 'StartDate', debutMois, 'c_period_id');
                
                if (!riri.records || riri.records.length === 0) {
                  console.log(`🔄 Recherche d'une période alternative...`);
                  const alternativePeriod = await fonction.getIDempiereModelsWhereSelect(
                    token, 
                    'c_period', 
                    'Name', 
                    `'Jun-25'`,
                    'c_period_id'
                  );
                  
                  if (alternativePeriod.records && alternativePeriod.records.length > 0) {
                    riri = alternativePeriod;
                    console.log(`✅ Période alternative trouvée: ${alternativePeriod.records[0].id}`);
                  } else {
                    throw new Error(`Aucune période trouvée pour la date ${dateformate}`);
                  }
                }

                let nouvelObjet = {
                  AD_Org_ID: { id: this.config.orgId },
                  AD_Client_ID: { id: this.config.clientId },
                  C_DocType_ID: { id: this.config.docTypeId },
                  DocumentNo: journalRef,
                  DateDoc: dateformate,
                  DateAcct: dateformate,
                  C_Period_ID: { id: riri.records[0].id },
                  Description: journalRef,
                  C_Currency_ID: { id: this.config.currencyId },
                  GL_Category_ID: { id: this.config.glCategoryId },
                  DocStatus: 'DR',
                  IsActive: true
                };
                
                console.log(`📅 Création journal en mode DRAFT:`, nouvelObjet);
                const journalResult = await fonction.creationtable(token, 'gl_journal', nouvelObjet);
                journalId = journalResult.id;
                console.log(`✅ Journal ${journalRef} créé avec ID: ${journalId}`);
              }
              
              let successLines = 0;
              let errorLines = 0;
              
              for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                const line = lines[lineIndex];
                try {
                  const compteValue = this.getRowValue(line, 'compte');
                  const debitValue = this.getRowValue(line, 'debit') || 0;
                  const creditValue = this.getRowValue(line, 'credit') || 0;
                  const dateValue = this.getRowValue(line, 'date');
                  
                  const accountResult = await fonction.getIDempiereModelsWhereSelect(
                    token, 
                    'c_elementvalue', 
                    'value', 
                    `'${compteValue}'`, 
                    'C_ElementValue_ID'
                  );
                  
                  if (!accountResult.records || accountResult.records.length === 0) {
                    console.error(`❌ Compte ${compteValue} non trouvé`);
                    errorLines++;
                    continue;
                  }
                  
                  const dateline = fonction.convertirDate(dateValue);
                  
                  let journalLinedata = {
                    GL_Journal_ID: { id: journalId },
                    Account_ID: { id: accountResult.records[0].id },
                    AmtSourceDr: parseFloat(debitValue) || 0,
                    AmtSourceCr: parseFloat(creditValue) || 0,
                    AmtAcctDr: parseFloat(debitValue) || 0,
                    AmtAcctCr: parseFloat(creditValue) || 0,
                    C_Currency_ID: { id: this.config.currencyId },
                    DateAcct: dateline,
                    Line: (lineIndex + 1) * 10
                  };
                  
                  console.log(`  📝 Ligne ${lineIndex + 1}: Compte ${compteValue}, Débit: ${debitValue}, Crédit: ${creditValue}`);
                  await fonction.creationtable(token, 'gl_journalline', journalLinedata);
                  successLines++;
                  
                } catch (lineError) {
                  console.error(`❌ Erreur ligne ${lineIndex + 1} du journal ${journalRef}:`, lineError);
                  errorLines++;
                }
              }
              
              console.log(`✅ Journal ${journalRef} terminé: ${successLines} lignes créées, ${errorLines} erreurs`);
              
            } catch (journalError) {
              console.error(`❌ Erreur fatale avec le journal ${journalRef}:`, journalError);
            }
          }
          
          let bPartnerSummary = '';
          if (this.detectedBPartners.length > 0) {
            const clients = this.detectedBPartners.filter(bp => bp.type === 'client');
            const fournisseurs = this.detectedBPartners.filter(bp => bp.type === 'fournisseur');
            bPartnerSummary = `\n- ${clients.length} clients et ${fournisseurs.length} fournisseurs créés automatiquement`;
          }
          
          this.message = `✅ Import terminé avec succès !\n- Comptes comptables créés/mis à jour\n- Journaux et écritures créés${bPartnerSummary}\n🎉 Vous pouvez maintenant créer des factures !`;
          
        } catch (error) {
          console.error("Erreur lors de l'importation:", error);
          this.message = `❌ Une erreur est survenue lors de l'importation des données: ${error.message}`;
        }
      } else {
        this.message = `❌ Aucune ligne n'a été insérée : date invalide à la ligne ${ligne}`;
      }
    },
    
    extractUniqueReferences() {
      const refMap = new Map();
      this.csvData1.forEach((row) => {
        const reference = this.getRowValue(row, 'reference');
        const date = this.getRowValue(row, 'date');
        if (reference && !refMap.has(reference)) {
          refMap.set(reference, date);
        }
      });
      this.uniqueReferences = Array.from(refMap.entries()).map(([reference, date]) => ({
        reference,
        date
      }));
    },
    
    transformData(data) {
      if (data.nom) {
        data.fullName = data.nom;
        delete data.nom;
      }
      return data;
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

:root {
  --primary-color: #4361ee;
  --secondary-color: #3f37c9;
  --accent-color: #4cc9f0;
  --light-color: #f8f9fa;
  --dark-color: #212529;
  --success-color: #2ecc71;
  --error-color: #e74c3c;
  --warning-color: #f39c12;
  --border-radius: 8px;
  --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

.csv-upload-container {
  font-family: 'Roboto', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: var(--dark-color);
}

.header-section {
  text-align: center;
  margin-bottom: 2.5rem;
}

.main-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 0;
}

.config-section {
  margin-bottom: 2rem;
}

.config-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--box-shadow);
  border-left: 4px solid var(--warning-color);
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.config-item label {
  font-weight: 500;
  color: var(--dark-color);
}

.config-item input, .config-item select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
}

.mapping-section {
  margin: 2rem 0;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: var(--border-radius);
}

.mapping-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.mapping-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mapping-item select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
}

.date-format-section {
  margin: 1rem 0;
  padding: 1rem;
  background-color: #e8f4fd;
  border-radius: var(--border-radius);
}

.config-save-btn {
  background-color: var(--success-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  margin-top: 1rem;
}

.config-toggle {
  text-align: right;
  margin-bottom: 1rem;
}

.config-toggle-btn {
  background-color: var(--warning-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
}

.column-preview {
  color: #6c757d;
  font-style: italic;
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

.mapping-validation {
  background-color: rgba(231, 76, 60, 0.1);
  border: 1px solid var(--error-color);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin: 1rem 0;
}

.error-item {
  color: var(--error-color);
  margin: 0.5rem 0;
}

.upload-section {
  margin-bottom: 2.5rem;
}

.file-upload-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--box-shadow);
  margin-bottom: 1.5rem;
}

.file-input-group {
  margin-bottom: 1.5rem;
}

.file-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px dashed #dee2e6;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
}

.file-label:hover {
  border-color: var(--primary-color);
  background-color: rgba(67, 97, 238, 0.05);
}

.file-label span {
  font-weight: 500;
  color: var(--dark-color);
}

.icon {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.file-input {
  display: none;
}

.validate-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  width: 100%;
  margin-top: 1rem;
}

.validate-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.validate-button:hover:not(:disabled) {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
}

.button-icon {
  font-size: 1.2rem;
}

.message-alert {
  padding: 1rem;
  border-radius: var(--border-radius);
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  background-color: rgba(46, 204, 113, 0.1);
  color: var(--success-color);
  border-left: 4px solid var(--success-color);
  white-space: pre-line;
}

.error-message {
  background-color: rgba(231, 76, 60, 0.1);
  color: var(--error-color);
  border-left: 4px solid var(--error-color);
}

.data-section {
  margin-bottom: 2rem;
}

.data-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.data-title {
  font-size: 1.3rem;
  font-weight: 600;
  padding: 1.25rem 1.5rem;
  margin: 0;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.table-wrapper {
  overflow-x: auto;
  padding: 0 1.5rem 1.5rem;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.styled-table th {
  background-color: var(--primary-color);
  color: white;
  font-weight: 500;
  padding: 0.75rem 1rem;
  text-align: left;
}

.styled-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #dee2e6;
}

.styled-table tbody tr:nth-child(even) {
  background-color: #f8f9fa;
}

.styled-table tbody tr:hover {
  background-color: rgba(67, 97, 238, 0.05);
}

.more-items {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 1rem;
}

.references-section {
  margin-bottom: 2rem;
}

.references-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.references-title {
  font-size: 1.3rem;
  font-weight: 600;
  padding: 1.25rem 1.5rem;
  margin: 0;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.references-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.reference-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border-radius: var(--border-radius);
  transition: var(--transition);
  border-left: 4px solid var(--primary-color);
}

.reference-item:hover {
  background-color: #e9ecef;
}

.reference-number {
  background-color: var(--primary-color);
  color: white;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.reference-details {
  flex: 1;
}

.reference-value {
  font-weight: 500;
  color: var(--dark-color);
}

.reference-date {
  font-size: 0.85rem;
  color: #6c757d;
}

.action-section {
  text-align: center;
  margin-top: 2.5rem;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background-color: var(--success-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: var(--box-shadow);
}

.action-button:hover {
  background-color: #27ae60;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .csv-upload-container {
    padding: 1rem;
  }
  
  .main-title {
    font-size: 1.8rem;
  }
  
  .references-grid, .config-grid, .mapping-grid {
    grid-template-columns: 1fr;
  }
  
  .file-label {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem 1rem;
  }
}
</style>
                '