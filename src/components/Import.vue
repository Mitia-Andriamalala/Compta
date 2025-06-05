<template>
  <div class="csv-upload-container">
    <div class="header-section">
      <h1 class="main-title">Importation de fichiers comptables</h1>
      <p class="subtitle">Chargez vos fichiers CSV pour traitement et validation</p>
    </div>

    <div class="upload-section">
      <div class="file-upload-card">
        <div class="file-input-group">
          <label class="file-label">
            <i class="fas fa-file-csv icon"></i>
            <span>Fichier des écritures comptables</span>
            <input type="file" @change="handleFileChange1" accept=".csv" class="file-input" />
          </label>
        </div>

        <div class="file-input-group">
          <label class="file-label">
            <i class="fas fa-file-csv icon"></i>
            <span>Fichier des comptes</span>
            <input type="file" @change="handleFileChange2" accept=".csv" class="file-input" />
          </label>
        </div>

        <button @click="valider" class="validate-button">
          <i class="fas fa-check-circle button-icon"></i>
          Valider les fichiers
        </button>
      </div>

      <div v-if="message" class="message-alert" :class="{ 'error-message': !message.includes('succès') }">
        <i class="fas" :class="message.includes('succès') ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
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
                <th v-for="(header, index) in csvData1[0]" :key="'header-' + index">{{ header }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in csvData1.slice(0, 5)" :key="'row-' + rowIndex">
                <td v-for="(value, cellIndex) in row" :key="'cell-' + cellIndex">{{ value }}</td>
              </tr>
              <tr v-if="csvData1.length > 5">
                <td :colspan="csvData1[0].length" class="more-items">
                  + {{ csvData1.length - 5 }} autres écritures...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="csvData2.length" class="data-section">
      <div class="data-card">
        <h2 class="data-title">
          <i class="fas fa-table"></i>
          Contenu du fichier des comptes
        </h2>
        <div class="table-wrapper">
          <table class="styled-table">
            <thead>
              <tr>
                <th v-for="(header, index) in csvData2[0]" :key="'header-' + index">{{ header }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in csvData2" :key="'row-' + rowIndex">
                <td v-for="(value, cellIndex) in row" :key="'cell-' + cellIndex">{{ value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="uniqueReferences.length" class="references-section">
      <div class="references-card">
        <h2 class="references-title">
          <i class="fas fa-list-ol"></i>
          Références uniques détectées
        </h2>
        <div class="references-grid">
          <div v-for="(reference, index) in uniqueReferences" :key="'reference-' + index" class="reference-item">
            <span class="reference-number">#{{ index + 1 }}</span>
            <div class="reference-details">
              <div class="reference-value">{{ reference.reference }}</div>
              <div class="reference-date">{{ reference.date }}</div>
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
      uniqueReferences: [],
      message: '',
    };
  },
  methods: {
    redirectToPage() {
      this.$router.push('/compte');
    },
    handleFileChange1(event) {
      const file = event.target.files[0];
      if (file) {
        Papa.parse(file, {
          complete: (result) => {
            this.csvData1 = result.data;
            this.extractUniqueReferences();
          },
          header: true,
        });
      }
    },
    handleFileChange2(event) {
      const file = event.target.files[0];
      if (file) {
        Papa.parse(file, {
          complete: (result) => {
            this.csvData2 = result.data;
          },
          header: true,
        });
      }
    },
    isDateValid(dateStr) {
      const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = dateStr.match(regex);
      if (!match) return false;

      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);

      if (month < 1 || month > 12) return false;

      const date = new Date(year, month - 1, day);
      return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
    },
    async valider() {
      console.log("valeur csv 1: ", this.csvData1);
      console.log("valeur csv 2: ", this.csvData2);
      var valide = true;
      var ligne = 0;
      const token = sessionStorage.getItem('authToken');
      
      // Vérification des dates
      for (let i = 0; i < this.csvData1.length; i++) {
        if (!this.isDateValid(this.csvData1[i].date)) {
          valide = false;
          ligne = i + 2;
          break;
        }
      }

      if (valide) {
        try {
          
          // Création des comptes
          for (let k = 0; k < this.csvData2.length; k++) {
            let comptedata = {
              AD_Org_ID: { id: 11 },
              AD_Client_ID: { id: 11 },
              isActive: true,
              C_Element_ID: { id: 105 },
              Value: this.csvData2[k].compte,
              Name: this.csvData2[k].libelle,
              AccountType: "R",
              AccountSign: "N",
              IsSummary: false
            };
            await fonction.creationtable(token, 'c_elementvalue', comptedata);
          }
          
          // Création des journaux
          for (let j = 0; j < this.uniqueReferences.length; j++) {
            let dateformate = fonction.convertirDate(this.uniqueReferences[j].date);
            let debutMois= fonction.getDebutMois(dateformate);
            let riri = await fonction.getIDempiereModelsWhereSelect(token, 'c_period', 'StartDate', debutMois, 'c_period_id');
            console.log(dateformate)
            console.log(debutMois)
            console.log(riri)

            let nouvelObjet = {
              AD_Org_ID: { id: 11 },
              C_DocType_ID: { id: 115 },
              DocumentNo: this.uniqueReferences[j].reference,
              DateDoc: dateformate,
              DateAcct: dateformate,
              C_Period_ID: { id: riri.records[0].id },
              Description: this.uniqueReferences[j].reference
            };
            await fonction.creationtable(token, 'gl_journal', nouvelObjet);
          }
          
          // Création des lignes de journal
          for (let l = 0; l < this.csvData1.length; l++) {
            const riri2 = await fonction.getIDempiereModelsWhereSelect(token, 'c_elementvalue', 'value', `'${this.csvData1[l].compte}'`, 'C_ElementValue_ID');
            const dateline=fonction.convertirDate(this.csvData1[l].date)
            let journalLinedata = {
              GL_Journal_ID: { identifier: this.csvData1[l].reference },
              Account_ID: { id: riri2.records[0].id },
              AmtSourceDr: this.csvData1[l].debit || 0,
              AmtSourceCr: this.csvData1[l].credit || 0,
              DateAcct: dateline
            };
            await fonction.creationtable(token, 'gl_journalline', journalLinedata);
          }
          
          this.message = "Les données ont été importées avec succès !";
        } catch (error) {
          console.error("Erreur lors de l'importation:", error);
          this.message = "Une erreur est survenue lors de l'importation des données.";
        }
      } else {
        this.message = `Aucune ligne n'a été insérée : date invalide à la ligne ${ligne}`;
      }
    },
    extractUniqueReferences() {
      const refMap = new Map();
      this.csvData1.forEach((row) => {
        if (!refMap.has(row.reference)) {
          refMap.set(row.reference, row.date);
        }
      });
      this.uniqueReferences = Array.from(refMap.entries()).map(([reference, date]) => ({
        reference,
        date,
      }));
    },
    transformData(data) {
      if (data.nom) {
        data.fullName = data.nom;
        delete data.nom;
      }
      return data;
    },
  },
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
  color: rgb(111, 109, 255);
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

.validate-button:hover {
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
  background-color: rgb(122, 122, 255);
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
  
  .references-grid {
    grid-template-columns: 1fr;
  }
  
  .file-label {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem 1rem;
  }
}
</style>