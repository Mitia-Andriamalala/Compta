<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Édition des Données Comptables iDempiere
        </h1>
        <p class="text-gray-600">
          Modifiez directement les journaux, comptes et business partners dans iDempiere
        </p>
      </div>

      <!-- Message d'état -->
      <div v-if="message" class="mb-4 p-4 rounded-md flex items-center" :class="getMessageClass()">
        <i class="fas mr-2" :class="getMessageIcon()"></i>
        {{ message }}
      </div>

      <!-- Barre d'outils -->
      <div class="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div class="flex items-center space-x-4">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Rechercher..."
                v-model="searchTerm"
                class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div v-if="activeTab === 'journals'" class="flex items-center space-x-2">
              <input
                type="date"
                v-model="filters.dateFrom"
                class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Date début"
              />
              <span class="text-gray-500">à</span>
              <input
                type="date"
                v-model="filters.dateTo"
                class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Date fin"
              />
            </div>
          </div>
          
          <button
            @click="handleRefresh"
            :disabled="loading"
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center"
          >
            <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': loading }"></i>
            Actualiser depuis iDempiere
          </button>
        </div>
      </div>

      <!-- Onglets -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="py-4 px-2 border-b-2 font-medium text-sm flex items-center"
              :class="activeTab === tab.id 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              <i :class="tab.icon" class="mr-2"></i>
              {{ tab.label }}
              <span class="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {{ tab.count }}
              </span>
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- Onglet Journaux -->
          <div v-if="activeTab === 'journals'" class="space-y-4">
            <h2 class="text-xl font-semibold mb-4">
              Journaux Comptables ({{ filteredJournals.length }})
              <i v-if="loading" class="fas fa-sync-alt animate-spin ml-2"></i>
            </h2>
            
            <div v-if="filteredJournals.length === 0 && !loading" class="text-center py-8 text-gray-500">
              <i class="fas fa-calendar-alt text-5xl mb-4 opacity-50"></i>
              <p>Aucun journal trouvé. Vérifiez votre recherche ou actualisez les données.</p>
            </div>
            
            <div v-else class="space-y-4">
              <div 
                v-for="journal in filteredJournals" 
                :key="journal.id" 
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex justify-between items-start mb-3">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                      <h3 class="font-semibold text-lg">{{ journal.documentNo }}</h3>
                      <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getStatusClass(journal.docStatus)">
                        {{ getStatusText(journal.docStatus) }}
                      </span>
                      <span class="text-xs text-gray-500">ID: {{ journal.id }}</span>
                    </div>
                    <p class="text-gray-600 mb-1">{{ journal.description }}</p>
                    <p class="text-sm text-gray-500">
                      Date doc: {{ formatDate(journal.dateDoc) }}
                      <span v-if="journal.dateAcct && journal.dateAcct !== journal.dateDoc">
                        | Date comptable: {{ formatDate(journal.dateAcct) }}
                      </span>
                    </p>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <div class="text-right mr-4">
                      <p class="text-sm text-gray-600">
                        Débit: <span class="font-medium text-blue-600">{{ formatNumber(journal.totalDebit) }}</span>
                      </p>
                      <p class="text-sm text-gray-600">
                        Crédit: <span class="font-medium text-green-600">{{ formatNumber(journal.totalCredit) }}</span>
                      </p>
                      <p class="text-xs text-gray-500">
                        Équilibré: {{ journal.totalDebit === journal.totalCredit ? '✅' : '❌' }}
                      </p>
                    </div>
                    <button
                      @click="onEditJournal(journal)"
                      class="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Modifier dans iDempiere"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      @click="handleDelete(journal, 'journal')"
                      class="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Supprimer de iDempiere"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                
                <!-- Lignes du journal -->
                <div v-if="journal.lines && journal.lines.length > 0" class="mt-3 border-t pt-3">
                  <h4 class="text-sm font-medium mb-2">
                    Lignes d'écriture ({{ journal.lines.length }}):
                  </h4>
                  <div class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                      <thead>
                        <tr class="bg-gray-50">
                          <th class="px-3 py-2 text-left">Ligne</th>
                          <th class="px-3 py-2 text-left">Compte</th>
                          <th class="px-3 py-2 text-left">Nom du compte</th>
                          <th class="px-3 py-2 text-right">Débit</th>
                          <th class="px-3 py-2 text-right">Crédit</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="line in journal.lines" :key="line.id" class="border-t hover:bg-gray-50">
                          <td class="px-3 py-2 text-gray-500">{{ line.line }}</td>
                          <td class="px-3 py-2 font-medium">{{ line.account }}</td>
                          <td class="px-3 py-2">{{ line.accountName }}</td>
                          <td class="px-3 py-2 text-right text-blue-600">
                            {{ line.debit ? formatNumber(line.debit) : '-' }}
                          </td>
                          <td class="px-3 py-2 text-right text-green-600">
                            {{ line.credit ? formatNumber(line.credit) : '-' }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Onglet Comptes -->
          <div v-if="activeTab === 'accounts'" class="space-y-4">
            <h2 class="text-xl font-semibold mb-4">
              Plan Comptable ({{ filteredAccounts.length }})
              <i v-if="loading" class="fas fa-sync-alt animate-spin ml-2"></i>
            </h2>
            
            <div v-if="filteredAccounts.length === 0 && !loading" class="text-center py-8 text-gray-500">
              <i class="fas fa-dollar-sign text-5xl mb-4 opacity-50"></i>
              <p>Aucun compte trouvé. Vérifiez votre recherche ou actualisez les données.</p>
            </div>
            
            <div v-else class="overflow-x-auto">
              <table class="min-w-full bg-white">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="account in filteredAccounts" :key="account.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{{ account.id }}</td>
                    <td class="px-6 py-4 whitespace-nowrap t
ext-sm font-medium text-gray-900">{{ account.value }}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">
                      {{ account.name }}
                      <span v-if="account.isSummary" class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Totalisation
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getAccountTypeClass(account.accountType)">
                        {{ getAccountTypeText(account.accountType) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 py-1 rounded-full text-xs font-medium" :class="account.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                        {{ account.isActive ? 'Actif' : 'Inactif' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        @click="handleEdit(account, 'account')"
                        class="text-blue-600 hover:text-blue-900"
                        title="Modifier dans iDempiere"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        @click="handleDelete(account, 'account')"
                        class="text-red-600 hover:text-red-900"
                        title="Supprimer de iDempiere"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Onglet Business Partners -->
          <div v-if="activeTab === 'partners'" class="space-y-4">
            <h2 class="text-xl font-semibold mb-4">
              Business Partners ({{ filteredBusinessPartners.length }})
              <i v-if="loading" class="fas fa-sync-alt animate-spin ml-2"></i>
            </h2>
            
            <div v-if="filteredBusinessPartners.length === 0 && !loading" class="text-center py-8 text-gray-500">
              <i class="fas fa-building text-5xl mb-4 opacity-50"></i>
              <p>Aucun Business Partner trouvé. Vérifiez votre recherche ou actualisez les données.</p>
            </div>
            
            <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div 
                v-for="bp in filteredBusinessPartners" 
                :key="bp.id" 
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex justify-between items-start mb-3">
                  <div class="flex items-center space-x-3">
                    <i v-if="bp.isCustomer" class="fas fa-user text-blue-500"></i>
                    <i v-if="bp.isVendor" class="fas fa-building text-purple-500"></i>
                    <div>
                      <h3 class="font-semibold">{{ bp.name }}</h3>
                      <p class="text-sm text-gray-600">Code: {{ bp.value }}</p>
                      <p class="text-xs text-gray-500">ID: {{ bp.id }}</p>
                    </div>
                  </div>
                  
                  <div class="flex space-x-1">
                    <button
                      @click="handleEdit(bp, 'bp')"
                      class="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Modifier dans iDempiere"
                    >
                      <i class="fas fa-edit text-sm"></i>
                    </button>
                    <button
                      @click="handleDelete(bp, 'bp')"
                      class="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Supprimer de iDempiere"
                    >
                      <i class="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                </div>
                
                <div class="space-y-2">
                  <p v-if="bp.taxId" class="text-xs text-gray-600">
                    <strong>N° fiscal:</strong> {{ bp.taxId }}
                  </p>
                  <p v-if="bp.description" class="text-xs text-gray-600">
                    <strong>Description:</strong> {{ bp.description }}
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <span v-if="bp.isCustomer" class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Client
                    </span>
                    <span v-if="bp.isVendor" class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      Fournisseur
                    </span>
                    <span class="px-2 py-1 rounded-full text-xs" :class="bp.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{ bp.isActive ? 'Actif' : 'Inactif' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <i class="fas fa-calendar-alt text-blue-500 text-2xl mr-3"></i>
            <div>
              <h3 class="text-lg font-semibold">Journaux</h3>
              <p class="text-2xl font-bold text-blue-600">{{ journals.length }}</p>
              <p class="text-sm text-gray-600">
                {{ journalStats.drafts }} brouillons, {{ journalStats.completed }} complets
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <i class="fas fa-dollar-sign text-green-500 text-2xl mr-3"></i>
            <div>
              <h3 class="text-lg font-semibold">Comptes</h3>
              <p class="text-2xl font-bold text-green-600">{{ accounts.length }}</p>
              <p class="text-sm text-gray-600">
                {{ accountStats.active }} actifs, {{ accountStats.inactive }} inactifs
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <i class="fas fa-building text-purple-500 text-2xl mr-3"></i>
            <div>
              <h3 class="text-lg font-semibold">Business Partners</h3>
              <p class="text-2xl font-bold text-purple-600">{{ businessPartners.length }}</p>
              <p class="text-sm text-gray-600">
                {{ bpStats.customers }} clients, {{ bpStats.vendors }} fournisseurs
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-blue-900 mb-3">💡 Instructions d'utilisation</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 class="font-medium mb-2">Modification des données :</h4>
            <ul class="space-y-1">
              <li>• Cliquez sur l'icône ✏️ pour modifier un élément</li>
              <li>• Modifiez les valeurs dans la popup qui s'ouvre</li>
              <li>• Cliquez sur "Sauvegarder dans iDempiere" pour valider</li>
              <li>• Les modifications sont appliquées directement dans iDempiere</li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium mb-2">Gestion des données :</h4>
            <ul class="space-y-1">
              <li>• Utilisez "Actualiser" pour recharger depuis iDempiere</li>
              <li>• La suppression est définitive dans iDempiere</li>
              <li>• Les IDs affichés correspondent aux IDs iDempiere</li>
              <li>• Les statuts de documents respectent les règles iDempiere</li>
            </ul>
          </div>
        </div>
        <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p class="text-yellow-800 text-sm">
            <strong>⚠️ Attention:</strong> Cette page modifie directement les données dans iDempiere. 
            Assurez-vous d'avoir une sauvegarde avant de faire des modifications importantes.
          </p>
        </div>
      </div>

      <!-- Modal d'édition -->
      <div v-if="editingItem" class="edit-modal-overlay">
        <div class="edit-modal-window">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">
              Modifier {{ getEditTitle() }}
              <span class="text-sm text-gray-500 ml-2">(ID: {{ editingItem.id }})</span>
            </h3>
            <button @click="editingItem = null" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="space-y-4">
            <!-- Formulaire Journal -->
            <template v-if="editingItem.type === 'journal'">
              <div class="edit-form-group">
                <label class="block text-sm font-medium mb-1">Numéro de document *</label>
                <input
                  type="text"
                  v-model="editingItem.documentNo"
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div class="edit-form-group">
                <label class="block text-sm font-medium mb-1">Date document *</label>
                <input
                  type="date"
                  v-model="editingItem.dateDoc"
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div class="edit-form-group">
                <label class="block text-sm font-medium mb-1">Date comptable</label>
                <input
                  type="date"
                  v-model="editingItem.dateAcct"
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div class="edit-form-group">
                <label class="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  v-model="editingItem.description"
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div class="edit-form-group">
                <label class="block text-sm font-medium mb-1">Statut du document</label>
                <select
                  v-model="editingItem.docStatus"
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DR">Brouillon</option>
                  <option value="IP">En cours</option>
                  <option value="CO">Complet</option>
                  <option value="CL">Fermé</option>
                  <option value="VO">Annulé</option>
                </select>
              </div>
              <!-- Lignes du journal -->
              <div v-if="editingItem.lines && editingItem.lines.length > 0" class="mt-4">
                <h4 class="text-sm font-medium mb-2">Lignes du journal</h4>
                <div class="overflow-x-auto">
                  <table class="min-w-full text-sm">
                    <thead>
                      <tr class="bg-gray-50">
                        <th class="px-3 py-2 text-left">Ligne</th>
                        <th class="px-3 py-2 text-left">Compte</th>
                        <th class="px-3 py-2 text-left">Description</th>
                        <th class="px-3 py-2 text-right">Débit</th>
                        <th class="px-3 py-2 text-right">Crédit</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(line, index) in editingItem.lines" :key="line.id" class="border-t">
                        <td class="px-3 py-2 text-gray-500">{{ line.line }}</td>
                        <td class="px-3 py-2">
                          <select
                            v-model="line.accountId"
                            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          >
                            <option v-for="account in accounts" :key="account.id" :value="account.id">
                              {{ account.value }} - {{ account.name }}
                            </option>
                          </select>
                        </td>
                        <td class="px-3 py-2">
                          <input
                            type="text"
                            v-model="line.description"
                            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td class="px-3 py-2 text-right">
                          <input
                            type="number"
                            v-model.number="line.debit"
                            min="0"
                            step="0.01"
                            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-right"
                          />
                        </td>
                        <td class="px-3 py-2 text-right">
                          <input
                            type="number"
                            v-model.number="line.credit"
                            min="0"
                            step="0.01"
                            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-right"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p v-if="journalBalanceError" class="text-red-600 text-sm mt-2">
                  {{ journalBalanceError }}
                </p>
              </div>
            </template>

            <!-- Formulaire Compte -->
            <template v-if="editingItem.type === 'account'">
              <div class="edit-form-group">
                <label class="block text-sm font-medium mb-1">Numéro de compte *</label>
                <input
                  type="text"
                  v-model="editingItem.value"
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div class="edit-form-group">
                <label class="block text-sm font-medium mb-1">Nom du compte *</label>
                <input
                  type="text"
                  v-model="editingItem.name"
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div class="edit-form-group">
                <label class="block text-sm font-medium mb-1">Type de compte</label>
                <select
                  v-model="editingItem.accountType"
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A">Actif</option>
                  <option value="L">Passif</option>
                  <option value="E">Charge</option>
                  <option value="R">Produit</option>
                  <option value="O">Propriétaire</option>
                  <option value="M">Mémo</option>
                </select>
              </div>
              <div class="flex items-center space-x-4">
                <div class="flex items-center">
                  <input type="checkbox" v-model="editingItem.isActive" class="mr-2" />
                  <label class="text-sm font-medium">Compte actif</label>
                </div>
                <div class="flex items-center">
                  <input type="checkbox" v-model="editingItem.isSummary" class="mr-2" />
                  <label class="text-sm font-medium">Compte de totalisation</label>
                </div>
              </div>
            </template>

            <!-- Formulaire Business Partner -->
            <template v-if="editingItem.type === 'bp'">
              <div class="edit-form-group">
                <label class="block text-sm font-medium mb-1">Code Business Partner *</label>
                <input
                  type="text"
                  v-model="editingItem.value"
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div class="edit-form-group">
                <label class="block text-sm font-medium mb-1">Nom *</label>
                <input
                  type="text"
                  v-model="editingItem.name"
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div class="edit-form-group">
                <label class="block text-sm font-medium mb-1">N° d'identification fiscale</label>
                <input
                  type="text"
                  v-model="editingItem.taxId"
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Numéro de TVA ou SIRET"
                />
              </div>
              <div class="edit-form-group">
                <label class="block text-sm font-medium mb-1">Description</label>
                <textarea
                  v-model="editingItem.description"
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows="3"
                ></textarea>
              </div>
              <div class="flex items-center space-x-4">
                <div class="flex items-center">
                  <input type="checkbox" v-model="editingItem.isCustomer" class="mr-2" />
                  <label class="text-sm font-medium">Client</label>
                </div>
                <div class="flex items-center">
                  <input type="checkbox" v-model="editingItem.isVendor" class="mr-2" />
                  <label class="text-sm font-medium">Fournisseur</label>
                </div>
                <div class="flex items-center">
                  <input type="checkbox" v-model="editingItem.isActive" class="mr-2" />
                  <label class="text-sm font-medium">Actif</label>
                </div>
              </div>
            </template>
          </div>

          <div class="edit-modal-actions">
            <button
              @click="editingItem = null"
              class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              @click="handleSave"
              :disabled="loading"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <i v-if="loading" class="fas fa-sync-alt animate-spin mr-2"></i>
              <i v-else class="fas fa-save mr-2"></i>
              Sauvegarder dans iDempiere
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import * as fonction from '../js/fonction.js';

export default {
  name: 'EditAccountingData',
  data() {
    return {
      activeTab: 'journals',
      searchTerm: '',
      loading: false,
      message: '',
      editingItem: null,
      journalBalanceError: '',
      filters: {
        dateFrom: '',
        dateTo: '',
        account: '',
        reference: ''
      },
      
      // Données iDempiere
      journals: [],
      accounts: [],
      businessPartners: [],
      
      // Configuration
      config: {
        orgId: 11,
        clientId: 11,
        elementId: 105,
        docTypeId: 115,
        glCategoryId: 108,
        currencyId: 100
      }
    };
  },

  computed: {
    tabs() {
      return [
        { 
          id: 'journals', 
          label: 'Journaux Comptables', 
          icon: 'fas fa-calendar-alt', 
          count: this.journals.length 
        },
        { 
          id: 'accounts', 
          label: 'Plan Comptable', 
          icon: 'fas fa-dollar-sign', 
          count: this.accounts.length 
        },
        { 
          id: 'partners', 
          label: 'Business Partners', 
          icon: 'fas fa-building', 
          count: this.businessPartners.length 
        }
      ];
    },

    filteredJournals() {
      return this.journals.filter(journal => {
        const matchesSearch = journal.documentNo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                             journal.description.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesDateFrom = !this.filters.dateFrom || journal.dateDoc >= this.filters.dateFrom;
        const matchesDateTo = !this.filters.dateTo || journal.dateDoc <= this.filters.dateTo;
        const matchesReference = !this.filters.reference || journal.documentNo.includes(this.filters.reference);
        
        return matchesSearch && matchesDateFrom && matchesDateTo && matchesReference;
      });
    },

    filteredAccounts() {
      return this.accounts.filter(account => 
        account.value.includes(this.searchTerm) || 
        account.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    },

    filteredBusinessPartners() {
      return this.businessPartners.filter(bp => 
        bp.value.includes(this.searchTerm) || 
        bp.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    },

    journalStats() {
      return {
        drafts: this.journals.filter(j => j.docStatus === 'DR').length,
        completed: this.journals.filter(j => j.docStatus === 'CO').length
      };
    },

    accountStats() {
      return {
        active: this.accounts.filter(a => a.isActive).length,
        inactive: this.accounts.filter(a => !a.isActive).length
      };
    },

    bpStats() {
      return {
        customers: this.businessPartners.filter(bp => bp.isCustomer).length,
        vendors: this.businessPartners.filter(bp => bp.isVendor).length
      };
    }
  },

  mounted() {
    this.loadAllData();
  },

  methods: {
    async loadAllData() {
      this.loading = true;
      this.message = '🔄 Chargement des données depuis iDempiere...';
      
      try {
        await Promise.all([
          this.loadJournals(),
          this.loadAccounts(),
          this.loadBusinessPartners()
        ]);
        this.message = '✅ Données chargées avec succès !';
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        this.message = '❌ Erreur lors du chargement des données';
      } finally {
        this.loading = false;
        setTimeout(() => { this.message = ''; }, 3000);
      }
    },

    async loadJournals() {
      try {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('Token d\'authentification manquant');
        }

        const journalsResponse = await fonction.getIDempiereModels(
          token,
          'gl_journal',
          'GL_Journal_ID,DocumentNo,DateDoc,DateAcct,Description,DocStatus,TotalDr,TotalCr,IsActive'
        );

        if (journalsResponse && journalsResponse.records) {
          const journalsData = journalsResponse.records.map(journal => ({
            id: journal.id,
            documentNo: journal.DocumentNo || '',
            dateDoc: journal.DateDoc ? journal.DateDoc.split('T')[0] : '',
            dateAcct: journal.DateAcct ? journal.DateAcct.split('T')[0] : '',
            description: journal.Description || '',
            docStatus: typeof journal.DocStatus === 'object' ? journal.DocStatus.id : journal.DocStatus || 'DR',
            totalDebit: parseFloat(journal.TotalDr || 0),
            totalCredit: parseFloat(journal.TotalCr || 0),
            isActive: journal.IsActive,
            lines: []
          }));

          this.journals = journalsData;

          // Charger les lignes pour chaque journal
          for (const journal of journalsData) {
            await this.loadJournalLines(journal.id);
          }
        }
      } catch (error) {
        console.error('Erreur chargement journaux:', error);
        throw error;
      }
    },

    async loadJournalLines(journalId) {
      try {
        const token = sessionStorage.getItem('authToken');
        
        const linesResponse = await fonction.getIDempiereModelsWhereSelect(
          token,
          'gl_journalline',
          'GL_Journal_ID',
          journalId.toString(),
          'GL_JournalLine_ID,Account_ID,AmtSourceDr,AmtSourceCr,Line,Description'
        );

        if (linesResponse && linesResponse.records) {
          const lines = [];
          
          for (const line of linesResponse.records) {
            let accountInfo = { value: '', name: '' };
            if (line.Account_ID) {
              let accountId = line.Account_ID;
              if (accountId && typeof accountId === 'object' && accountId.id) {
                accountId = accountId.id;
              }
              accountId = accountId ? accountId.toString() : '';
              const accountResponse = await fonction.getIDempiereModelsWhereSelect(
                token,
                'c_elementvalue',
                'C_ElementValue_ID',
                accountId,
                'Value,Name'
              );
              
              if (accountResponse && accountResponse.records && accountResponse.records.length > 0) {
                accountInfo = {
                  value: accountResponse.records[0].Value || '',
                  name: accountResponse.records[0].Name || ''
                };
              }
            }

            lines.push({
              id: line.id,
              accountId: line.Account_ID,
              account: accountInfo.value,
              accountName: accountInfo.name,
              debit: parseFloat(line.AmtSourceDr || 0),
              credit: parseFloat(line.AmtSourceCr || 0),
              line: line.Line || 0,
              description: line.Description || ''
            });
          }

          // Mettre à jour le journal avec ses lignes
          const journalIndex = this.journals.findIndex(j => j.id === journalId);
          if (journalIndex !== -1) {
            this.journals[journalIndex].lines = lines.sort((a, b) => a.line - b.line);
          }
        }
      } catch (error) {
        console.error(`Erreur chargement lignes journal ${journalId}:`, error);
      }
    },

    async loadAccounts() {
      try {
        const token = sessionStorage.getItem('authToken');
        
        const accountsResponse = await fonction.getIDempiereModels(
          token,
          'c_elementvalue',
          'C_ElementValue_ID,Value,Name,AccountType,AccountSign,IsSummary,IsActive'
        );

        if (accountsResponse && accountsResponse.records) {
          this.accounts = accountsResponse.records.map(account => ({
            id: account.id,
            value: account.Value || '',
            name: account.Name || '',
            accountType: typeof account.AccountType === 'object' ? account.AccountType.id : account.AccountType || 'A',
            accountSign: account.AccountSign || 'N',
            isSummary: account.IsSummary || false,
            isActive: account.IsActive !== false
          }));
        }
      } catch (error) {
        console.error('Erreur chargement comptes:', error);
        throw error;
      }
    },

    async loadBusinessPartners() {
      try {
        const token = sessionStorage.getItem('authToken');
        
        const bpartnersResponse = await fonction.getIDempiereModels(
          token,
          'c_bpartner',
          'C_BPartner_ID,Value,Name,IsVendor,IsCustomer,IsActive,TaxID,Description'
        );

        if (bpartnersResponse && bpartnersResponse.records) {
          this.businessPartners = bpartnersResponse.records.map(bp => ({
            id: bp.id,
            value: bp.Value || '',
            name: bp.Name || '',
            isVendor: bp.IsVendor || false,
            isCustomer: bp.IsCustomer || false,
            isActive: bp.IsActive !== false,
            taxId: bp.TaxID || '',
            description: bp.Description || ''
          }));
        }
      } catch (error) {
        console.error('Erreur chargement business partners:', error);
        throw error;
      }
    },

    formatNumber(value) {
      return new Intl.NumberFormat('fr-FR').format(value);
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('fr-FR');
    },

    getStatusClass(status) {
      const statusMap = {
        'DR': 'bg-yellow-100 text-yellow-800',
        'CO': 'bg-green-100 text-green-800',
        'CL': 'bg-gray-100 text-gray-800',
        'VO': 'bg-red-100 text-red-800',
        'IP': 'bg-blue-100 text-blue-800'
      };
      return statusMap[status] || 'bg-gray-100 text-gray-800';
    },

    getStatusText(status) {
      const statusMap = {
        'DR': 'Brouillon',
        'CO': 'Complet',
        'CL': 'Fermé',
        'VO': 'Annulé',
        'IP': 'En cours'
      };
      return statusMap[status] || status;
    },

    getAccountTypeClass(type) {
      const typeMap = {
        'A': 'bg-blue-100 text-blue-800',
        'L': 'bg-purple-100 text-purple-800',
        'E': 'bg-red-100 text-red-800',
        'R': 'bg-green-100 text-green-800',
        'O': 'bg-indigo-100 text-indigo-800',
        'M': 'bg-gray-100 text-gray-800'
      };
      return typeMap[type] || 'bg-gray-100 text-gray-800';
    },

    getAccountTypeText(type) {
      const typeMap = {
        'A': 'Actif',
        'L': 'Passif',
        'E': 'Charge',
        'R': 'Produit',
        'O': 'Propriétaire',
        'M': 'Mémo'
      };
      return typeMap[type] || type;
    },

    getMessageClass() {
      if (this.message.includes('✅')) {
        return 'bg-green-50 text-green-700 border border-green-200';
      } else if (this.message.includes('❌')) {
        return 'bg-red-50 text-red-700 border border-red-200';
      } else {
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      }
    },

    getMessageIcon() {
      if (this.message.includes('✅')) {
        return 'fa-check-circle';
      } else if (this.message.includes('❌')) {
        return 'fa-exclamation-circle';
      } else {
        return 'fa-sync-alt';
      }
    },

    getEditTitle() {
      if (this.editingItem.type === 'journal') return 'le journal';
      if (this.editingItem.type === 'account') return 'le compte';
      if (this.editingItem.type === 'bp') return 'le Business Partner';
      return 'l\'élément';
    },

    handleEdit: async function(item, type) {
      // Si c'est un journal et qu'il n'a pas de lignes, charge-les
      if (type === 'journal' && (!item.lines || item.lines.length === 0)) {
        await this.loadJournalLines(item.id);
        // On récupère l'objet mis à jour dans this.journals
        const journal = this.journals.find(j => j.id === item.id);
        item = journal ? journal : item;
      }
      // Créer une copie profonde pour éviter de modifier directement l'objet original
      this.editingItem = JSON.parse(JSON.stringify({ ...item, type }));
    },

    validateJournalLines(lines) {
      const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
      const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
      if (totalDebit !== totalCredit) {
        return `Le journal n'est pas équilibré : Débit (${this.formatNumber(totalDebit)}) ≠ Crédit (${this.formatNumber(totalCredit)})`;
      }
      return '';
    },

    async handleSave() {
      if (!this.editingItem) return;
      
      this.loading = true;
      this.message = '💾 Sauvegarde en cours...';
      
      try {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('Token d\'authentification manquant');
        }

        if (this.editingItem.type === 'journal') {
          // Valider que le journal est équilibré
          this.journalBalanceError = this.validateJournalLines(this.editingItem.lines);
          if (this.journalBalanceError) {
            this.message = `❌ ${this.journalBalanceError}`;
            this.loading = false;
            return;
          }

          // Mettre à jour le journal
          const journalData = {
            DocumentNo: this.editingItem.documentNo,
            DateDoc: this.editingItem.dateDoc,
            DateAcct: this.editingItem.dateAcct || this.editingItem.dateDoc,
            Description: this.editingItem.description,
            DocStatus: this.editingItem.docStatus
          };

          await fonction.updateIDempiereModel(
            token,
            'gl_journal',
            this.editingItem.id,
            journalData
          );

          // Mettre à jour les lignes du journal
          for (const line of this.editingItem.lines) {
            const lineData = {
              Account_ID: line.accountId,
              AmtSourceDr: line.debit || 0,
              AmtSourceCr: line.credit || 0,
              Line: line.line,
              Description: line.description
            };

            await fonction.updateIDempiereModel(
              token,
              'gl_journalline',
              line.id,
              lineData
            );
          }

          const journalIndex = this.journals.findIndex(j => j.id === this.editingItem.id);
          if (journalIndex !== -1) {
            this.journals[journalIndex] = { ...this.editingItem, totalDebit: this.editingItem.lines.reduce((sum, line) => sum + (line.debit || 0), 0), totalCredit: this.editingItem.lines.reduce((sum, line) => sum + (line.credit || 0), 0) };
          }

        } else if (this.editingItem.type === 'account') {
          const updateData = {
            Value: this.editingItem.value,
            Name: this.editingItem.name,
            AccountType: this.editingItem.accountType,
            IsActive: this.editingItem.isActive,
            IsSummary: this.editingItem.isSummary
          };

          await fonction.updateIDempiereModel(
            token,
            'c_elementvalue',
            this.editingItem.id,
            updateData
          );

          const accountIndex = this.accounts.findIndex(a => a.id === this.editingItem.id);
          if (accountIndex !== -1) {
            this.accounts[accountIndex] = { ...this.editingItem };
          }

        } else if (this.editingItem.type === 'bp') {
          const updateData = {
            Value: this.editingItem.value,
            Name: this.editingItem.name,
            IsVendor: this.editingItem.isVendor,
            IsCustomer: this.editingItem.isCustomer,
            IsActive: this.editingItem.isActive,
            TaxID: this.editingItem.taxId || this.editingItem.value,
            Description: this.editingItem.description
          };

          await fonction.updateIDempiereModel(
            token,
            'c_bpartner',
            this.editingItem.id,
            updateData
          );

          const bpIndex = this.businessPartners.findIndex(bp => bp.id === this.editingItem.id);
          if (bpIndex !== -1) {
            this.businessPartners[bpIndex] = { ...this.editingItem };
          }
        }
        
        this.message = '✅ Modifications sauvegardées avec succès dans iDempiere !';
        this.editingItem = null;
        this.journalBalanceError = '';
        
      } catch (error) {
        console.error('Erreur sauvegarde:', error);
        this.message = `❌ Erreur lors de la sauvegarde: ${error.message}`;
      } finally {
        this.loading = false;
        setTimeout(() => { this.message = ''; }, 5000);
      }
    },

    async handleDelete(item, type) {
      if (!confirm(`Êtes-vous sûr de vouloir supprimer cet élément de iDempiere ?\n\nCette action est irréversible !`)) {
        return;
      }
      
      this.loading = true;
      this.message = '🗑️ Suppression en cours...';
      
      try {
        const token = sessionStorage.getItem('authToken');
        
        if (type === 'journal') {
          if (item.lines && item.lines.length > 0) {
            for (const line of item.lines) {
              await fonction.deleteIDempiereModel(token, 'gl_journalline', line.id);
            }
          }
          
          await fonction.deleteIDempiereModel(token, 'gl_journal', item.id);
          this.journals = this.journals.filter(j => j.id !== item.id);
          
        } else if (type === 'account') {
          await fonction.deleteIDempiereModel(token, 'c_elementvalue', item.id);
          this.accounts = this.accounts.filter(a => a.id !== item.id);
          
        } else if (type === 'bp') {
          await fonction.deleteIDempiereModel(token, 'c_bpartner', item.id);
          this.businessPartners = this.businessPartners.filter(bp => bp.id !== item.id);
        }
        
        this.message = '✅ Élément supprimé avec succès de iDempiere !';
        
      } catch (error) {
        console.error('Erreur suppression:', error);
        this.message = `❌ Erreur lors de la suppression: ${error.message}`;
      } finally {
        this.loading = false;
        setTimeout(() => { this.message = ''; }, 5000);
      }
    },

    async handleRefresh() {
      await this.loadAllData();
    },

    async onEditJournal(journal) {
      await this.handleEdit(journal, 'journal');
    }
  }
};
</script>

<style scoped>
/* === Palette et base === */
:root {
  --primary: #2563eb;
  --primary-light: #3b82f6;
  --danger: #ef4444;
  --success: #22c55e;
  --bg: #f8fafc;
  --white: #fff;
  --gray: #6b7280;
  --border: #e5e7eb;
  --radius: 10px;
}
body, .min-h-screen {
  background: var(--bg);
  font-family: 'Segoe UI', Arial, sans-serif;
  color: #222;
}
.max-w-7xl {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.bg-white { background: var(--white); }
.rounded-lg, .rounded-md { border-radius: var(--radius); }
.shadow-sm { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.border { border: 1px solid var(--border); }
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
.mt-8 { margin-top: 2rem; }
.text-3xl { font-size: 2rem; font-weight: bold; }
.text-xl { font-size: 1.3rem; font-weight: bold; }
.text-lg { font-size: 1.1rem; font-weight: bold; }
.text-sm { font-size: 0.97rem; }
.font-bold { font-weight: bold; }
.font-semibold { font-weight: 600; }
.text-gray-900 { color: #222; }
.text-gray-600 { color: var(--gray); }
.text-gray-500 { color: #888; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
.flex-col { flex-direction: column; }
.space-x-2 > * + * { margin-left: 0.5rem; }
.space-x-4 > * + * { margin-left: 1rem; }
.space-y-4 > * + * { margin-top: 1rem; }

/* === Inputs & boutons === */
input, select, textarea {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.5rem 0.8rem;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
  background: var(--white);
  color: #222;
  transition: border 0.2s;
}
input:focus, select:focus, textarea:focus {
  border-color: var(--primary);
  outline: none;
}
button {
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.3rem;
  background: var(--primary);
  color: var(--white);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.18s, box-shadow 0.18s;
  box-shadow: 0 1px 2px rgba(59,130,246,0.04);
  display: inline-flex;
  align-items: center;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
button:hover:not(:disabled) {
  background: var(--primary-light);
}

/* === Tableaux === */
.table, table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: var(--white);
}
th, td {
  border: 1px solid var(--border);
  padding: 0.7rem 0.9rem;
  text-align: left;
  font-size: 1rem;
}
th {
  background: var(--bg);
  font-weight: 600;
}
tr:hover td {
  background: #f1f5f9;
}
.text-center { text-align: center; }
.text-right { text-align: right; }

/* === Modale améliorée === */
.edit-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.edit-modal-window {
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 2rem 1.5rem;
  max-width: 520px;
  width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 1010;
  animation: modalFadeIn 0.25s;
}
.edit-form-group {
  margin-bottom: 1.1rem;
}
.edit-modal-window h3, .edit-modal-window h4 {
  margin-bottom: 0.7rem;
}
.edit-modal-window table {
  margin-top: 1.2rem;
  margin-bottom: 0.7rem;
}
.edit-modal-window .edit-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.7rem;
  margin-top: 2rem;
}
@media (max-width: 600px) {
  .edit-modal-window {
    padding: 1rem 0.3rem;
    max-width: 99vw;
  }
  .edit-modal-window .edit-modal-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* === Badges === */
.badge {
  display: inline-block;
  padding: 0.2em 0.7em;
  border-radius: 999px;
  font-size: 0.92em;
  font-weight: 500;
  background: #e5e7eb;
  color: #222;
}
.badge-success { background: #dcfce7; color: #15803d; }
.badge-danger { background: #fee2e2; color: #b91c1c; }
.badge-info { background: #dbeafe; color: #1e40af; }
.badge-warning { background: #fef3c7; color: #92400e; }

/* === Messages d'état === */
.state-message {
  padding: 0.8rem 1rem;
  border-radius: var(--radius);
  margin-bottom: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.state-message.success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.state-message.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.state-message.info { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }

/* === Responsive === */
@media (max-width: 768px) {
  .max-w-7xl { padding: 1rem 0.5rem; }
  .p-6 { padding: 1rem; }
  .modal-window { padding: 1.2rem 0.5rem; }
  th, td { font-size: 0.95rem; }
}
</style>