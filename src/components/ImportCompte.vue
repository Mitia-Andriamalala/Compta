<template>
  <div class="import-comptes">
    <h2>Importer comptes comptables</h2>
    <input type="file" accept=".csv" @change="handleFileUpload" />
    <button :disabled="!csvData.length || isLoading" @click="importComptes">
      Importer dans iDempiere
    </button>

    <div v-if="isLoading">Import en cours...</div>

    <div v-if="csvData.length">
      <h3>Données extraites du CSV</h3>
      <table border="1" cellpadding="5">
        <thead>
          <tr>
            <th>Compte (Value)</th>
            <th>Libellé (Name)</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(compte, index) in csvData" :key="index">
            <td>{{ compte.Value }}</td>
            <td>{{ compte.Name }}</td>
            <td>{{ compte.Description }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { parse } from 'vue/compiler-sfc';

// Données extraites du CSV : tableau d'objets { Value, Name, Description }
const csvData = ref([]);

// Résultats de l'import, tableau d'objets { Value, Name, success: true/false }
const importResults = ref([]);

// Indicateur de chargement pendant l'import API
const isLoading = ref(false);

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
    const reader = new FileReader();

    reader.onload = (e) => {
        const text = e.target.result;
        parseCSV(text);
    }

    reader.readAsText(file);
}

function parseCSV(csvText)
{
    //Reset data
    csvData.value = [];

    const lines = csvText.split('\n').filter(line => line.trim() !== '');

    // Supposons que la 1ère ligne est l'en-tête
    // Ex: compte,libelle

    const headers = lines[0].split(',').map(header => header.trim());
    
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim())

        // Créer un objet dynamique selon les headers
        let obj = {}
        headers.forEach((header, index) => {
        obj[header] = cols[index] || ''
        })

    // Normaliser l'objet pour notre usage : Value, Name, Description
    csvData.value.push({
      Value: obj.compte || '',
      Name: obj.libelle || '',
      Description: obj.libelle || ''
    })
  }
}

async function importComptes() {
  importResults.value = []
  isLoading.value = true

  // Récupération du token avec la bonne clé
  const token = sessionStorage.getItem('idempiere_token')
  if (!token) {
    alert('Token manquant. Veuillez vous connecter.')
    isLoading.value = false
    return
  }

  for (const compte of csvData.value) {
    const payload = {
      AD_Client_ID: { id: 11 },
      AD_Org_ID: { id: 0 },
      Name: compte.Name,
      Description: compte.Description,
      C_Element_ID: { id: 105 },
      Value: compte.Value,
      AccountSign: { id: "N" },
      AccountType: { id: "L" },
      IsActive: true,
      PostActual: true,
      PostBudget: true,
      PostStatistical: true,
      IsDocControlled: true,
      PostEncumbrance: true,
      IsForeignCurrency: false,
      IsBankAccount: false,
      IsDetailBPartner: false,
      IsDetailProduct: false
    }

    console.log('Payload envoyé à iDempiere:', payload)

    try {
      const response = await fetch('/api/api/v1/models/c_elementvalue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': Bearer ${token}
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Compte ajouté:', data)
        importResults.value.push({ ...compte, success: true, id: data.id })
      } else {
        const errorText = await response.text()
        console.error('Erreur API:', errorText)
        importResults.value.push({ ...compte, success: false, error: errorText })
      }
    } catch (error) {
      console.error('Exception lors de l’import :', error)
      importResults.value.push({ ...compte, success: false, error: error.message })
    }
  }


  isLoading.value = false
}

</script>