<template>
  <div class="page-container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">{{ activeTab === 'facture' ? '📋' : '💰' }}</span>
          {{ activeTab === 'facture' ? 'Nouvelle Facture' : 'Nouveau Règlement' }}
        </h1>
        <p class="page-subtitle">{{ activeTab === 'facture' ? 'Créez et gérez vos factures clients et fournisseurs' : 'Enregistrez et suivez vos règlements' }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Navigation Tabs -->
      <div class="tabs-section">
        <div class="tabs-container">
          <button
            :class="['tab-button', { active: activeTab === 'facture' }]"
            @click="switchTab('facture')"
          >
            📄 Facture
          </button>
          <button
            :class="['tab-button', { active: activeTab === 'reglement' }]"
            @click="switchTab('reglement')"
          >
            💰 Règlement
          </button>
        </div>
      </div>

      <!-- Facture Form -->
      <div v-if="activeTab === 'facture'" class="form-container">
        <form @submit.prevent="submitFacture" class="facture-form">
          
          <!-- Section Informations Générales -->
          <div class="form-section">
            <h2 class="section-title">
              <span class="section-icon">ℹ️</span>
              Informations Générales
            </h2>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="numeroFacture">Numéro de Facture *</label>
                <input
                  id="numeroFacture"
                  v-model="facture.numeroFacture"
                  type="text"
                  placeholder="FAC-2025-001"
                  required
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="dateFacture">Date de Facture *</label>
                <input
                  id="dateFacture"
                  v-model="facture.dateFacture"
                  type="date"
                  required
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="dateEcheance">Date d'Échéance</label>
                <input
                  id="dateEcheance"
                  v-model="facture.dateEcheance"
                  type="date"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="typeFacture">Type de Facture *</label>
                <select
                  id="typeFacture"
                  v-model="facture.typeFacture"
                  required
                  class="form-select"
                  @change="onTypeFactureChange"
                >
                  <option value="">Sélectionner le type</option>
                  <option value="vente">Facture de Vente</option>
                  <option value="achat">Facture d'Achat</option>
                  <option value="avoir">Avoir</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Section Client/Fournisseur -->
          <div class="form-section">
            <h2 class="section-title">
              <span class="section-icon">👤</span>
              {{ facture.typeFacture === 'achat' ? 'Fournisseur' : 'Client' }}
            </h2>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="compteClient">Compte {{ facture.typeFacture === 'achat' ? 'Fournisseur' : 'Client' }} *</label>
                <select
                  id="compteClient"
                  v-model="facture.compteClientId"
                  required
                  class="form-select"
                  @change="onCompteClientChange"
                >
                  <option value="">Sélectionner un compte</option>
                  <option 
                    v-for="compte in clientsDisponibles" 
                    :key="compte.id" 
                    :value="compte.id"
                  >
                    {{ compte.Value }} - {{ compte.Name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="nomClient">Nom *</label>
                <input
                  id="nomClient"
                  v-model="facture.client.nom"
                  type="text"
                  placeholder="Nom du client/fournisseur"
                  required
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="emailClient">Email</label>
                <input
                  id="emailClient"
                  v-model="facture.client.email"
                  type="email"
                  placeholder="email@exemple.com"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="adresseClient">Adresse</label>
                <textarea
                  id="adresseClient"
                  v-model="facture.client.adresse"
                  placeholder="Adresse complète"
                  class="form-textarea"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Section Lignes de Facture -->
          <div class="form-section">
            <div class="section-header">
              <h2 class="section-title">
                <span class="section-icon">📦</span>
                Lignes de Facture
              </h2>
              <button type="button" @click="ajouterLigne" class="btn-add">
                + Ajouter une ligne
              </button>
            </div>

            <div class="lignes-container">
              <div
                v-for="(ligne, index) in facture.lignes"
                :key="ligne.id"
                class="ligne-facture"
              >
                <div class="ligne-header">
                  <span class="ligne-number">{{ index + 1 }}</span>
                  <button
                    type="button"
                    @click="supprimerLigne(index)"
                    class="btn-remove"
                    v-if="facture.lignes.length > 1"
                  >
                    ✕
                  </button>
                </div>

                <div class="ligne-content">
                  <div class="form-group">
                    <label>Désignation *</label>
                    <input
                      v-model="ligne.designation"
                      type="text"
                      placeholder="Description de l'article/service"
                      required
                      class="form-input"
                    />
                  </div>

                  <div class="form-group">
                    <label>Compte Comptable *</label>
                    <select
                      v-model="ligne.compteComptableId"
                      required
                      class="form-select"
                    >
                      <option value="">Sélectionner un compte</option>
                      <option 
                        v-for="compte in lignesDisponibles" 
                        :key="compte.id" 
                        :value="compte.id"
                      >
                        {{ compte.Value }} - {{ compte.Name }}
                      </option>
                    </select>
                  </div>

                  <div class="ligne-details">
                    <div class="form-group">
                      <label>Quantité *</label>
                      <input
                        v-model.number="ligne.quantite"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        class="form-input"
                        @input="validateNumberInput(ligne, 'quantite')"
                      />
                    </div>

                    <div class="form-group">
                      <label>Prix Unitaire HT *</label>
                      <input
                        v-model.number="ligne.prixUnitaire"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        class="form-input"
                        @input="validateNumberInput(ligne, 'prixUnitaire')"
                      />
                    </div>

                    <div class="form-group">
                      <label>TVA (%)</label>
                      <select
                        v-model.number="ligne.tva"
                        class="form-select"
                        @change="calculerTotaux"
                      >
                        <option value="0">0%</option>
                        <option value="5.5">5.5%</option>
                        <option value="10">10%</option>
                        <option value="20">20%</option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label>Total HT</label>
                      <div class="total-display">
                        {{ formatCurrency(ligne.quantite * ligne.prixUnitaire) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section Comptes TVA -->
          <div class="form-section" v-if="facture.totaux.totalTVA > 0">
            <h2 class="section-title">
              <span class="section-icon">🧾</span>
              Comptes TVA
            </h2>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="compteTVA">Compte TVA *</label>
                <select
                  id="compteTVA"
                  v-model="facture.compteTVAId"
                  required
                  class="form-select"
                >
                  <option value="">Sélectionner compte TVA</option>
                  <option 
                    v-for="compte in tvaDisponibles" 
                    :key="compte.id" 
                    :value="compte.id"
                  >
                    {{ compte.Value }} - {{ compte.Name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Section Totaux -->
          <div class="form-section">
            <h2 class="section-title">
              <span class="section-icon">💰</span>
              Totaux
            </h2>
            
            <div class="totaux-container">
              <div class="total-row">
                <span class="total-label">Total HT:</span>
                <span class="total-value">{{ formatCurrency(facture.totaux.totalHT) }}</span>
              </div>
              <div class="total-row">
                <span class="total-label">Total TVA:</span>
                <span class="total-value">{{ formatCurrency(facture.totaux.totalTVA) }}</span>
              </div>
              <div class="total-row total-final">
                <span class="total-label">Total TTC:</span>
                <span class="total-value">{{ formatCurrency(facture.totaux.totalTTC) }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" @click="resetForm" class="btn-secondary">
              Annuler
            </button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting">⏳ Création...</span>
              <span v-else>💾 Créer la Facture</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Reglement Form -->
      <div v-if="activeTab === 'reglement'" class="form-container">
        <form @submit.prevent="submitReglement" class="reglement-form">
          
          <!-- Section Informations du Règlement -->
          <div class="form-section">
            <h2 class="section-title">
              <span class="section-icon">💳</span>
              Informations du Règlement
            </h2>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="numeroReglement">Numéro de Règlement *</label>
                <input
                  id="numeroReglement"
                  v-model="reglement.numeroReglement"
                  type="text"
                  placeholder="REG-2025-001"
                  required
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="dateReglement">Date de Règlement *</label>
                <input
                  id="dateReglement"
                  v-model="reglement.dateReglement"
                  type="date"
                  required
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="montantReglement">Montant *</label>
                <input
                  id="montantReglement"
                  v-model.number="reglement.montant"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="form-input"
                  @input="validateNumberInput(reglement, 'montant')"
                />
              </div>

              <div class="form-group">
                <label for="modeReglement">Mode de Règlement *</label>
                <select
                  id="modeReglement"
                  v-model="reglement.modeReglement"
                  required
                  class="form-select"
                >
                  <option value="">Sélectionner le mode</option>
                  <option value="especes">Espèces</option>
                  <option value="cheque">Chèque</option>
                  <option value="virement">Virement</option>
                  <option value="cb">Carte Bancaire</option>
                  <option value="prelevement">Prélèvement</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Section Comptes -->
          <div class="form-section">
            <h2 class="section-title">
              <span class="section-icon">🏦</span>
              Comptes Comptables
            </h2>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="compteBanque">Compte Bancaire *</label>
                <select
                  id="compteBanque"
                  v-model="reglement.compteBanqueId"
                  required
                  class="form-select"
                >
                  <option value="">Sélectionner compte bancaire</option>
                  <option 
                    v-for="compte in bancairesDisponibles" 
                    :key="compte.id" 
                    :value="compte.id"
                  >
                    {{ compte.Value }} - {{ compte.Name }} ({{ formatCurrency(compte.balance.balance) }})
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="compteClientReglement">Compte Client *</label>
                <select
                  id="compteClientReglement"
                  v-model="reglement.compteClientId"
                  required
                  class="form-select"
                >
                  <option value="">Sélectionner compte client</option>
                  <option 
                    v-for="compte in clientsDisponibles" 
                    :key="compte.id" 
                    :value="compte.id"
                  >
                    {{ compte.Value }} - {{ compte.Name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" @click="resetReglementForm" class="btn-secondary">
              Annuler
            </button>
            <button type="submit" class="btn-primary" :disabled="isSubmittingReglement">
              <span v-if="isSubmittingReglement">⏳ Enregistrement...</span>
              <span v-else>💾 Enregistrer le Règlement</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <span class="success-icon">✅</span>
          <h3>{{ activeTab === 'facture' ? 'Facture Créée' : 'Règlement Enregistré' }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ successMessage }}</p>
          <div v-if="ecrituresComptables.length > 0" class="ecritures-preview">
            <h4>Écritures comptables générées :</h4>
            <div v-for="ecriture in ecrituresComptables" :key="ecriture.id" class="ecriture-item">
              {{ ecriture.compte }} - {{ ecriture.debit ? 'Débit' : 'Crédit' }} : {{ formatCurrency(ecriture.montant) }}
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeSuccessModal" class="btn-primary">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'facture',
      isSubmitting: false,
      isSubmittingReglement: false,
      showSuccessModal: false,
      successMessage: '',
      ecrituresComptables: [],
      comptesComptables: [],
      clients: [],
      fournisseurs: [],
      typesDocuments: [],
      taxes: [], // ⭐ AJOUTÉ

      facture: {
        numeroFacture: '',
        dateFacture: new Date().toISOString().split('T')[0],
        dateEcheance: '',
        typeFacture: '',
        compteClientId: '',
        compteTVAId: '',
        client: {
          nom: '',
          email: '',
          adresse: '',
          siret: '',
        },
        lignes: [
          {
            id: Date.now(),
            designation: '',
            quantite: 1,
            prixUnitaire: 0,
            tva: 20,
            compteComptableId: '',
          },
        ],
        totaux: {
          totalHT: 0,
          totalTVA: 0,
          totalTTC: 0,
        },
        notes: '',
      },

      reglement: {
        numeroReglement: '',
        dateReglement: new Date().toISOString().split('T')[0],
        montant: 0,
        modeReglement: '',
        factureAssociee: '',
        client: '',
        compteBanqueId: '',
        compteClientId: '',
        numeroCheque: '',
        banque: '',
        referenceVirement: '',
        commentaires: '',
      },
    };
  },

  computed: {
    clientsDisponibles() {
      if (this.facture.typeFacture === 'achat') {
        return this.fournisseurs;
      } else {
        return this.clients;
      }
    },
    
    bancairesDisponibles() {
      return this.getComptesBancaires();
    },
    
    lignesDisponibles() {
      return this.getComptesLignes();
    },
    
    tvaDisponibles() {
      return this.getComptesTVA();
    }
  },

  methods: {
    getComptesBancaires() {
      if (!this.comptesComptables || this.comptesComptables.length === 0) {
        return [];
      }
      
      const comptesBanques = this.comptesComptables.filter(compte => {
        const isAsset = compte.AccountType === 'A';
        const isBanque = compte.Name && (
          compte.Name.toLowerCase().includes('banque') || 
          compte.Name.toLowerCase().includes('caisse') ||
          (compte.Value && (compte.Value.startsWith('51') || compte.Value.startsWith('53')))
        );
        return isAsset && isBanque;
      });
      
      console.log('Comptes bancaires trouvés:', comptesBanques);
      return comptesBanques;
    },

    getComptesLignes() {
      if (!this.comptesComptables || this.comptesComptables.length === 0) {
        return [];
      }
      
      let comptesLignes = [];
      
      if (this.facture.typeFacture === 'vente') {
        comptesLignes = this.comptesComptables.filter(compte => compte.AccountType === 'R');
      } else if (this.facture.typeFacture === 'achat') {
        comptesLignes = this.comptesComptables.filter(compte => compte.AccountType === 'E');
      } else {
        comptesLignes = this.comptesComptables.filter(compte => 
          compte.AccountType === 'R' || compte.AccountType === 'E'
        );
      }
      
      console.log(`Comptes lignes pour ${this.facture.typeFacture || 'tous'}:`, comptesLignes);
      return comptesLignes;
    },

    getComptesTVA() {
      if (!this.comptesComptables || this.comptesComptables.length === 0) {
        return [];
      }
      
      const comptesTVA = this.comptesComptables.filter(compte => {
        const isLiability = compte.AccountType === 'L';
        const isTVA = compte.Name && (
          compte.Name.toLowerCase().includes('tva') || 
          compte.Name.toLowerCase().includes('taxe') ||
          (compte.Value && compte.Value.startsWith('445'))
        );
        return isLiability && isTVA;
      });
      
      console.log('Comptes TVA trouvés:', comptesTVA);
      return comptesTVA;
    },

    onTypeFactureChange() {
      this.facture.lignes.forEach(ligne => {
        ligne.compteComptableId = '';
      });
      
      this.$nextTick(() => {
        console.log('Type facture changé vers:', this.facture.typeFacture);
        console.log('Comptes lignes disponibles:', this.getComptesLignes());
      });
    },

    onCompteClientChange() {
      let selectedPartner;
      if (this.facture.typeFacture === 'achat') {
        selectedPartner = this.fournisseurs.find(f => f.id == this.facture.compteClientId);
      } else {
        selectedPartner = this.clients.find(c => c.id == this.facture.compteClientId);
      }
      
      if (selectedPartner) {
        this.facture.client.nom = selectedPartner.Name;
        console.log('✅ Business Partner sélectionné:', selectedPartner);
      }
    },

    switchTab(tab) {
      this.activeTab = tab;
      if (this.$route && this.$route.query && this.$route.query.tab !== tab) {
        this.$router.replace({ query: { ...this.$route.query, tab } });
      }
    },

    ajouterLigne() {
      this.facture.lignes.push({
        id: Date.now() + Math.random(),
        designation: '',
        quantite: 1,
        prixUnitaire: 0,
        tva: 20,
        compteComptableId: '',
      });
      this.calculerTotaux();
    },

    supprimerLigne(index) {
      this.facture.lignes.splice(index, 1);
      this.calculerTotaux();
    },

    validateNumberInput(obj, field) {
      if (isNaN(obj[field]) || obj[field] === '') {
        obj[field] = 0;
      }
      if (obj[field] < 0) {
        obj[field] = 0;
      }
      this.calculerTotaux();
    },

    calculerTotaux() {
      let totalHT = 0;
      let totalTVA = 0;

      this.facture.lignes.forEach((ligne) => {
        const quantite = Number(ligne.quantite) || 0;
        const prixUnitaire = Number(ligne.prixUnitaire) || 0;
        const tva = Number(ligne.tva) || 0;

        const ligneHT = quantite * prixUnitaire;
        const ligneTVA = ligneHT * (tva / 100);

        totalHT += ligneHT;
        totalTVA += ligneTVA;
      });

      this.facture.totaux = {
        totalHT: Number(totalHT.toFixed(2)),
        totalTVA: Number(totalTVA.toFixed(2)),
        totalTTC: Number((totalHT + totalTVA).toFixed(2)),
      };
    },

    genererEcrituresFacture() {
      const ecritures = [];
      
      if (this.facture.typeFacture === 'vente') {
        ecritures.push({
          id: Date.now() + 1,
          compte: this.getCompteById(this.facture.compteClientId)?.Value || '',
          debit: true,
          montant: this.facture.totaux.totalTTC
        });

        this.facture.lignes.forEach((ligne, index) => {
          ecritures.push({
            id: Date.now() + index + 2,
            compte: this.getCompteById(ligne.compteComptableId)?.Value || '',
            debit: false,
            montant: ligne.quantite * ligne.prixUnitaire
          });
        });

        if (this.facture.totaux.totalTVA > 0) {
          ecritures.push({
            id: Date.now() + 100,
            compte: this.getCompteById(this.facture.compteTVAId)?.Value || '',
            debit: false,
            montant: this.facture.totaux.totalTVA
          });
        }
      } else if (this.facture.typeFacture === 'achat') {
        this.facture.lignes.forEach((ligne, index) => {
          ecritures.push({
            id: Date.now() + index + 1,
            compte: this.getCompteById(ligne.compteComptableId)?.Value || '',
            debit: true,
            montant: ligne.quantite * ligne.prixUnitaire
          });
        });

        if (this.facture.totaux.totalTVA > 0) {
          ecritures.push({
            id: Date.now() + 100,
            compte: this.getCompteById(this.facture.compteTVAId)?.Value || '',
            debit: true,
            montant: this.facture.totaux.totalTVA
          });
        }

        ecritures.push({
          id: Date.now() + 200,
          compte: this.getCompteById(this.facture.compteClientId)?.Value || '',
          debit: false,
          montant: this.facture.totaux.totalTTC
        });
      }

      return ecritures;
    },

    genererEcrituresReglement() {
      const ecritures = [];
      
      if (this.reglement.typeReglement === 'encaissement') {
        ecritures.push({
          id: Date.now() + 1,
          compte: this.getCompteById(this.reglement.compteBanqueId)?.Value || '',
          debit: true,
          montant: this.reglement.montant
        });

        ecritures.push({
          id: Date.now() + 2,
          compte: this.getCompteById(this.reglement.compteClientId)?.Value || '',
          debit: false,
          montant: this.reglement.montant
        });
      } else {
        ecritures.push({
          id: Date.now() + 1,
          compte: this.getCompteById(this.reglement.compteClientId)?.Value || '',
          debit: true,
          montant: this.reglement.montant
        });

        ecritures.push({
          id: Date.now() + 2,
          compte: this.getCompteById(this.reglement.compteBanqueId)?.Value || '',
          debit: false,
          montant: this.reglement.montant
        });
      }

      return ecritures;
    },

    getCompteById(id) {
      return this.comptesComptables.find(compte => compte.id === id);
    },

    // ⭐ NOUVELLE MÉTHODE AJOUTÉE
    async createDefaultAddress(businessPartnerId, token) {
      console.log('🏠 Création d\'une adresse par défaut pour BP ID:', businessPartnerId);
      
      try {
        // 1. Vérifier d'abord si une adresse existe déjà
        const existingResponse = await fetch(`/api/v1/models/c_bpartner_location?$filter=C_BPartner_ID eq ${businessPartnerId} and IsActive eq true`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (existingResponse.ok) {
          const existingData = await existingResponse.json();
          if (existingData.records && existingData.records.length > 0) {
            console.log('✅ Adresse existante trouvée:', existingData.records[0]);
            return existingData.records[0].id;
          }
        }

        // 2. Créer d'abord une Location (C_Location)
        const locationData = {
          AD_Client_ID: { id: 11 },
          AD_Org_ID: { id: 11 },
          Address1: 'Adresse par défaut',
          City: 'Ville',
          Postal: '00000',
          C_Country_ID: { id: 102 }, // France (ID standard dans iDempiere)
          IsActive: true
        };

        const locationResponse = await fetch('/api/v1/models/c_location', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(locationData)
        });

        if (!locationResponse.ok) {
          const locationError = await locationResponse.text();
          console.error('❌ Erreur création C_Location:', locationError);
          throw new Error(`Impossible de créer la localisation: ${locationError}`);
        }

        const createdLocation = await locationResponse.json();
        const locationId = createdLocation.id;
        console.log('✅ C_Location créée avec ID:', locationId);

        // 3. Créer ensuite le C_BPartner_Location
        const bpartnerLocationData = {
          AD_Client_ID: { id: 11 },
          AD_Org_ID: { id: 11 },
          C_BPartner_ID: { id: parseInt(businessPartnerId) },
          C_Location_ID: { id: locationId },
          Name: 'Adresse principale',
          IsShipTo: true,
          IsBillTo: true,
          IsActive: true
        };

        const bpartnerLocationResponse = await fetch('/api/v1/models/c_bpartner_location', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bpartnerLocationData)
        });

        if (!bpartnerLocationResponse.ok) {
          const bpLocationError = await bpartnerLocationResponse.text();
          console.error('❌ Erreur création C_BPartner_Location:', bpLocationError);
          throw new Error(`Impossible de créer l'adresse Business Partner: ${bpLocationError}`);
        }

        const createdBPLocation = await bpartnerLocationResponse.json();
        console.log('✅ C_BPartner_Location créée avec ID:', createdBPLocation.id);
        
        return createdBPLocation.id;

      } catch (error) {
        console.error('❌ Erreur complète création adresse:', error);
        throw error;
      }
    },

    // ⭐ NOUVELLE MÉTHODE AJOUTÉE
    async loadTaxes() {
      try {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('Token d\'authentification manquant');
        }

        const response = await fetch('/api/v1/models/c_tax?$filter=IsActive eq true', {
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          this.taxes = data.records ? data.records.map(tax => ({
            id: tax.id,
            Name: tax.Name,
            Rate: tax.Rate || 0,
            TaxIndicator: tax.TaxIndicator,
            IsActive: tax.IsActive
          })) : [];
          
          console.log('✅ Taxes chargées depuis iDempiere:', this.taxes);
          
        } else {
          throw new Error(`Erreur API taxes: ${response.status}`);
        }
        
      } catch (error) {
        console.error('❌ Erreur chargement taxes:', error);
        console.log('⚠️ Utilisation de taxes par défaut');
        
        this.taxes = [
          { id: null, Name: 'TVA 0%', Rate: 0 },
          { id: null, Name: 'TVA 5.5%', Rate: 5.5 },
          { id: null, Name: 'TVA 10%', Rate: 10 },
          { id: null, Name: 'TVA 20%', Rate: 20 }
        ];
      }
    },

    // ⭐ MÉTHODE REMPLACÉE
    getTaxId(tvaPercent) {
      const tax = this.taxes.find(t => Math.abs(t.Rate - tvaPercent) < 0.01);
      
      if (tax && tax.id) {
        console.log(`✅ Taxe trouvée: ${tvaPercent}% -> ID ${tax.id} (${tax.Name})`);
        return tax.id;
      }
      
      if (this.taxes.length > 0 && this.taxes[0].id) {
        console.log(`⚠️ Taxe ${tvaPercent}% introuvable, utilisation de la première: ${this.taxes[0].Name} (ID: ${this.taxes[0].id})`);
        return this.taxes[0].id;
      }
      
      console.log(`❌ Aucune taxe disponible pour ${tvaPercent}%`);
      return null;
    },

    // ⭐ MÉTHODE REMPLACÉE
    async submitFacture() {
      if (!this.facture.numeroFacture || !this.facture.dateFacture || !this.facture.typeFacture) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
      }

      if (!this.facture.compteClientId) {
        alert('Le Business Partner (client/fournisseur) est requis.');
        return;
      }

      const isValidBPartner = this.clientsDisponibles.some(bp => bp.id == this.facture.compteClientId);
      if (!isValidBPartner) {
        alert('Veuillez sélectionner un client ou fournisseur valide.');
        console.error('❌ Business Partner invalide:', {
          selected: this.facture.compteClientId,
          available: this.clientsDisponibles
        });
        return;
      }

      const docTypeId = this.getDocTypeId();
      if (!docTypeId) {
        alert('Type de document invalide. Vérifiez la configuration iDempiere.');
        return;
      }

      if (this.facture.lignes.some((ligne) => !ligne.designation || ligne.quantite <= 0 || ligne.prixUnitaire <= 0)) {
        alert('Veuillez vérifier les lignes de facture (désignation, quantité et prix unitaire requis).');
        return;
      }

      if (this.taxes.length === 0) {
        console.log('⚠️ Taxes non chargées, rechargement...');
        await this.loadTaxes();
      }

      this.isSubmitting = true;
      try {
        const token = sessionStorage.getItem('authToken');
        if (!token) throw new Error('Utilisateur non authentifié.');

        const selectedPartner = this.clientsDisponibles.find(bp => bp.id == this.facture.compteClientId);

        let locationId = await this.createDefaultAddress(this.facture.compteClientId, token);

        const factureData = {
          AD_Client_ID: 11,
          AD_Org_ID: 11,
          DocumentNo: this.facture.numeroFacture,
          DateInvoiced: this.facture.dateFacture,
          DateAcct: this.facture.dateFacture,
          C_BPartner_ID: parseInt(this.facture.compteClientId),
          C_BPartner_Location_ID: parseInt(locationId),
          C_DocType_ID: parseInt(docTypeId),
          Description: this.facture.notes || `Facture ${this.facture.typeFacture} - ${selectedPartner?.Name}`,
          GrandTotal: parseFloat(this.facture.totaux.totalTTC) || 0,
          TotalLines: parseFloat(this.facture.totaux.totalHT) || 0,
          IsSOTrx: this.facture.typeFacture === 'vente',
          DocStatus: 'DR',
          IsActive: true
        };

        const factureResponse = await fetch('/api/v1/models/c_invoice', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(factureData)
        });

        if (!factureResponse.ok) {
          const errorText = await factureResponse.text();
          throw new Error(`Erreur création facture: ${errorText}`);
        }

        const createdFacture = await factureResponse.json();
        const factureId = createdFacture.id;

        for (let i = 0; i < this.facture.lignes.length; i++) {
          const ligne = this.facture.lignes[i];
          const taxId = this.getTaxId(ligne.tva);

          const ligneData = {
            AD_Client_ID: 11,
            AD_Org_ID: 11,
            C_Invoice_ID: parseInt(factureId),
            Line: (i + 1) * 10,
            Description: ligne.designation,
            QtyInvoiced: parseFloat(ligne.quantite) || 0,
            QtyEntered: parseFloat(ligne.quantite) || 0,
            PriceEntered: parseFloat(ligne.prixUnitaire) || 0,
            PriceActual: parseFloat(ligne.prixUnitaire) || 0,
            LineNetAmt: (parseFloat(ligne.quantite) || 0) * (parseFloat(ligne.prixUnitaire) || 0),
            C_UOM_ID: 100,
            IsActive: true
          };

          if (taxId) {
            ligneData.C_Tax_ID = parseInt(taxId);
          }

          const ligneResponse = await fetch('/api/v1/models/c_invoiceline', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(ligneData)
          });

          if (!ligneResponse.ok) {
            const ligneError = await ligneResponse.text();
            throw new Error(`Erreur création ligne ${i + 1}: ${ligneError}`);
          }
        }

        console.log('🎉 Facture complète créée avec succès!');
        this.successMessage = `✅ Facture ${this.facture.numeroFacture} créée avec succès !`;
        this.showSuccessModal = true;

        setTimeout(() => {
          this.resetForm();
        }, 3000);

      } catch (error) {
        console.error('❌ Erreur création facture:', error);
        alert(`Erreur: ${error.message}`);
      } finally {
        this.isSubmitting = false;
      }
    },

    async submitReglement() {
      if (
        !this.reglement.numeroReglement ||
        !this.reglement.dateReglement ||
        !this.reglement.montant ||
        !this.reglement.modeReglement ||
        !this.reglement.compteBanqueId ||
        !this.reglement.compteClientId
      ) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
      }

      if (this.reglement.montant <= 0) {
        alert('Le montant doit être supérieur à 0.');
        return;
      }

      this.isSubmittingReglement = true;
      try {
        const token = sessionStorage.getItem('authToken');
        if (!token) throw new Error('Utilisateur non authentifié.');

        const compteClient = this.getCompteById(this.reglement.compteClientId);
        this.reglement.typeReglement = compteClient?.Name.toLowerCase().includes('client') ? 'encaissement' : 'decaissement';

        this.ecrituresComptables = this.genererEcrituresReglement();

        const reglementData = {
          DocumentNo: this.reglement.numeroReglement,
          DateTrx: this.reglement.dateReglement,
          C_BPartner_ID: this.reglement.compteClientId,
          C_BankAccount_ID: this.reglement.compteBanqueId,
          PayAmt: this.reglement.montant,
          TenderType: this.getTenderType(this.reglement.modeReglement),
          Description: this.reglement.commentaires,
          ecrituresComptables: this.ecrituresComptables
        };

        const paymentResponse = await fetch('/api/v1/models/c_payment', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reglementData)
        });

        if (!paymentResponse.ok) {
          throw new Error(`Erreur lors de la création du règlement dans iDempiere: ${paymentResponse.status}`);
        }

        const createdPayment = await paymentResponse.json();

        this.successMessage = `Règlement ${this.reglement.numeroReglement} de ${this.formatCurrency(this.reglement.montant)} enregistré avec succès !`;
        this.showSuccessModal = true;

        setTimeout(() => {
          this.resetReglementForm();
        }, 5000);
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du règlement:', error);
        alert(`Erreur: ${error.message || 'Échec de l\'enregistrement du règlement.'}`);
      } finally {
        this.isSubmittingReglement = false;
      }
    },

    resetForm() {
      this.facture = {
        numeroFacture: '',
        dateFacture: new Date().toISOString().split('T')[0],
        dateEcheance: '',
        typeFacture: '',
        compteClientId: '',
        compteTVAId: '',
        client: {
          nom: '',
          email: '',
          adresse: '',
          siret: '',
        },
        lignes: [
          {
            id: Date.now(),
            designation: '',
            quantite: 1,
            prixUnitaire: 0,
            tva: 20,
            compteComptableId: '',
          },
        ],
        totaux: {
          totalHT: 0,
          totalTVA: 0,
          totalTTC: 0,
        },
        notes: '',
      };
      this.ecrituresComptables = [];
      this.generateNumeroFacture();
      this.calculerTotaux();
    },

    resetReglementForm() {
      this.reglement = {
        numeroReglement: '',
        dateReglement: new Date().toISOString().split('T')[0],
        montant: 0,
        modeReglement: '',
        factureAssociee: '',
        client: '',
        compteBanqueId: '',
        compteClientId: '',
        numeroCheque: '',
        banque: '',
        referenceVirement: '',
        commentaires: '',
      };
      this.ecrituresComptables = [];
      this.generateNumeroReglement();
    },

    closeSuccessModal() {
      this.showSuccessModal = false;
      this.successMessage = '';
      this.ecrituresComptables = [];
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(value || 0);
    },

    generateNumeroFacture() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      this.facture.numeroFacture = `FAC-${year}${month}-${random}`;
    },

    generateNumeroReglement() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      this.reglement.numeroReglement = `REG-${year}${month}-${random}`;
    },

    async loadComptesComptables() {
      try {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('Token d\'authentification manquant');
        }

        const response = await fetch('/api/v1/models/c_elementvalue', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        
        console.log('Structure des données reçues:', data);
        console.log('Premier compte:', data.records?.[0] || data[0]);
        
        this.comptesComptables = data.records ? data.records.map(compte => ({
          id: compte.id,
          Value: compte.Value,
          Name: compte.Name,
          AccountType: compte.AccountType?.id || compte.AccountType,
          AccountSign: compte.AccountSign?.id || compte.AccountSign,
          balance: compte.balance || { balance: 0, totalDebit: 0, totalCredit: 0 },
          C_Element_ID: compte.C_Element_ID?.id || compte.C_Element_ID,
          IsActive: compte.IsActive,
          IsSummary: compte.IsSummary,
          PostActual: compte.PostActual
        })) : data.map ? data.map(compte => ({
          id: compte.C_ElementValue_ID || compte.id,
          Value: compte.Value,
          Name: compte.Name,
          AccountType: compte.AccountType?.id || compte.AccountType,
          AccountSign: compte.AccountSign?.id || compte.AccountSign,
          balance: compte.balance || { balance: 0, totalDebit: 0, totalCredit: 0 },
          C_Element_ID: compte.C_Element_ID?.id || compte.C_Element_ID,
          IsActive: compte.IsActive,
          IsSummary: compte.IsSummary,
          PostActual: compte.PostActual
        })) : [];

        console.log(`${this.comptesComptables.length} comptes comptables chargés depuis iDempiere`);
        console.log('Comptes mappés:', this.comptesComptables);
        
      } catch (error) {
        console.error('Erreur lors du chargement des comptes depuis iDempiere:', error);
        console.warn('API iDempiere non disponible - veuillez vérifier la connexion');
        this.comptesComptables = [];
      }
    },

    async loadClientsEtFournisseurs() {
      try {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('Token d\'authentification manquant');
        }

        const response = await fetch('/api/v1/models/c_bpartner?$filter=IsActive eq true', {
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          }
        });

        if (response.ok) {
          const data = await response.json();
          const allPartners = data.records || [];
          
          this.clients = allPartners
            .filter(partner => partner.IsCustomer === true)
            .map(client => ({
              id: client.id,
              Value: client.Value,
              Name: client.Name,
              TaxID: client.TaxID,
              IsActive: client.IsActive,
              IsCustomer: client.IsCustomer,
              IsVendor: client.IsVendor
            }));

          this.fournisseurs = allPartners
            .filter(partner => partner.IsVendor === true)
            .map(fournisseur => ({
              id: fournisseur.id,
              Value: fournisseur.Value,
              Name: fournisseur.Name,
              TaxID: fournisseur.TaxID,
              IsActive: fournisseur.IsActive,
              IsCustomer: fournisseur.IsCustomer,
              IsVendor: fournisseur.IsVendor
            }));

          console.log(`✅ Chargement réussi: ${this.clients.length} clients et ${this.fournisseurs.length} fournisseurs`);
          console.log('👥 Clients disponibles:', this.clients);
          console.log('🏢 Fournisseurs disponibles:', this.fournisseurs);
          
        } else {
          throw new Error(`Erreur API: ${response.status}`);
        }
        
      } catch (error) {
        console.error('❌ Erreur chargement Business Partners:', error);
        console.log('⚠️ Aucun Business Partner trouvé. Assurez-vous d\'avoir fait l\'import des données CSV d\'abord.');
        this.clients = [];
        this.fournisseurs = [];
      }
    },

    async loadTypesDocuments() {
      try {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('Token d\'authentification manquant');
        }

        const response = await fetch('/api/v1/models/c_doctype?$filter=DocBaseType eq \'ARI\' or DocBaseType eq \'API\'', {
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          this.typesDocuments = data.records ? data.records.map(docType => ({
            id: docType.C_DocType_ID || docType.id,
            Name: docType.Name,
            DocBaseType: docType.DocBaseType?.id || docType.DocBaseType,
            IsActive: docType.IsActive
          })) : [];
          
          console.log('Types de documents chargés:', this.typesDocuments);
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement des types de documents:', error);
        this.typesDocuments = [];
      }
    },

    getDocTypeId() {
      let docBaseType;
      if (this.facture.typeFacture === 'vente') {
        docBaseType = 'ARI';
      } else if (this.facture.typeFacture === 'achat') {
        docBaseType = 'API';
      } else {
        docBaseType = 'ARI';
      }
      
      const docType = this.typesDocuments.find(dt => dt.DocBaseType === docBaseType);
      const docTypeId = docType ? docType.id : null;
      
      console.log(`Type facture: ${this.facture.typeFacture} -> DocBaseType: ${docBaseType} -> DocType ID: ${docTypeId}`);
      
      return docTypeId;
    },

    getTenderType(modeReglement) {
      const tenderTypes = {
        'especes': 'X',
        'cheque': 'K',
        'virement': 'A',
        'cb': 'C',
        'prelevement': 'D'
      };
      return tenderTypes[modeReglement] || 'A';
    },

    async diagnoseBusinessPartners() {
      console.log('\n🔍 DIAGNOSTIC du système:');
      console.log(`Clients chargés: ${this.clients.length}`);
      console.log(`Fournisseurs chargés: ${this.fournisseurs.length}`);
      
      if (this.clients.length === 0 && this.fournisseurs.length === 0) {
        console.log('⚠️ PROBLÈME: Aucun Business Partner trouvé');
        console.log('💡 SOLUTION: Vérifiez que l\'import CSV a bien créé les Business Partners');
        
        const token = sessionStorage.getItem('authToken');
        try {
          const allBP = await fetch('/api/v1/models/c_bpartner', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (allBP.ok) {
            const data = await allBP.json();
            console.log(`📊 Total Business Partners dans iDempiere: ${data.records?.length || 0}`);
            
            if (data.records?.length > 0) {
              console.log('👥 Business Partners disponibles:', 
                data.records.map(bp => `${bp.Value} - ${bp.Name} (Client: ${bp.IsCustomer}, Fournisseur: ${bp.IsVendor})`));
            }
          }
        } catch (error) {
          console.log('❌ Impossible de diagnostiquer:', error);
        }
      } else {
        console.log('✅ Business Partners chargés correctement');
      }
    }
  },

  async mounted() {
    if (this.$route && this.$route.query && this.$route.query.tab) {
      this.activeTab = this.$route.query.tab;
    }
    
    await Promise.all([
      this.loadComptesComptables(),
      this.loadClientsEtFournisseurs(),
      this.loadTypesDocuments(),
      this.loadTaxes()
    ]);
    
    this.generateNumeroFacture();
    this.generateNumeroReglement(); 
    this.calculerTotaux();

    setTimeout(() => {
      this.diagnoseBusinessPartners();
    }, 2000);
  },

  watch: {
    'facture.lignes': {
      handler() {
        this.calculerTotaux();
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
/* CSS essentiel uniquement - Fonctionnalité prioritaire */
.page-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* Tabs */
.tabs-section {
  background: white;
  border-radius: 8px;
  padding: 0.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.tabs-container {
  display: flex;
  gap: 0.5rem;
}

.tab-button {
  flex: 1;
  padding: 1rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.tab-button.active {
  background: #667eea;
  color: white;
}

/* Forms */
.form-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Lignes de facture */
.ligne-facture {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.ligne-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.ligne-number {
  background: #667eea;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.ligne-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.total-display {
  background: #f0fdf4;
  border: 1px solid #22c55e;
  border-radius: 6px;
  padding: 0.75rem;
  font-weight: 600;
  color: #166534;
  text-align: center;
}

/* Buttons */
.btn-add,
.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-add {
  background: #10b981;
  color: white;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-remove {
  background: #ef4444;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-primary:hover,
.btn-add:hover {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Totaux */
.totaux-container {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.total-final {
  background: #667eea;
  color: white;
  margin: 1rem -1.5rem -1.5rem;
  padding: 1rem 1.5rem;
  border-radius: 0 0 8px 8px;
  font-weight: 700;
}

.total-value {
  font-weight: 600;
  font-family: monospace;
}

/* Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
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
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.ecritures-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
  text-align: left;
}

.ecriture-item {
  font-family: monospace;
  font-size: 0.875rem;
  margin: 0.25rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .ligne-details {
    grid-template-columns: 1fr;
  }
  
  .tabs-container {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>