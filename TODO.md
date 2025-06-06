# TODO Fonctionnalités & Fichiers

## Authentification
- **Login utilisateur**
  - Saisie identifiants, appel API, stockage du token, gestion des erreurs
  - **Fichier :** `src/components/Login.vue`
  - **Extrait de code :**
    ```javascript
    async function handleLogin() {
      // Reset errors
      usernameError.value = '';
      passwordError.value = '';
      message.value = '';
      
      // Validation
      if (!username.value) {
        usernameError.value = 'Le nom d\'utilisateur est requis';
        return;
      }
      if (!password.value) {
        passwordError.value = 'Le mot de passe est requis';
        return;
      }

      isLoading.value = true;

      try {
        const response = await axios.post('/api/v1/auth/tokens', {
          userName: username.value,
          password: password.value,
          parameters:{
              "clientId":11,
              "roleId":102,
              "organizationId":11,
              "warehouseId":103,
              "language":"en_US"
          }
        });

        if (response.status === 200) {
          success.value = true;
          message.value = "Connexion réussie!";
          const token = response.data.token;
          sessionStorage.setItem('authToken', token);
          console.log("Token:", response.data.token);
          
          setTimeout(() => {
            router.push('/import');
          }, 1500);
        }
      } catch (error) {
        success.value = false;
        if (error.response) {
          message.value = "Échec: " + error.response.data.message;
        } else {
          message.value = "Erreur réseau: " + error.message;
        }
      } finally {
        isLoading.value = false;
      }
    }
    ```

## Import de données
- **Import de fichiers CSV (écritures et comptes)**
  - Parsing CSV, affichage d'un aperçu, validation, création des comptes via API
  - **Fichier :** `src/components/Import.vue`
  - **Utilitaires :** `src/js/fonction.js` (fonctions d'appel API, création)
  - **Extrait de code :**
    ```javascript
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
    }
    ```

## Navigation & Structure
- **Barre de navigation**
  - Affichage des liens, gestion de la session, navigation
  - **Fichier :** `src/components/NavBar.vue`
- **Routing (pages principales)**
  - Définition des routes, protection par authentification
  - **Fichier :** `src/router.js`
  - **Extrait de code :**
    ```javascript
    const routes = [
      { path: '/', name: 'Login', component: Login },
      { path: '/balance', name: 'Balance', component: Balance },
      { 
        path: '/compte', 
        name: 'Compte', 
        component: Compte, 
        meta: { requiresAuth: true } 
      },
      { 
        path: '/livreCompte', 
        name: 'LivreCompte', 
        component: LivreCompte, 
        meta: { requiresAuth: true } 
      },
      { 
        path: '/import', 
        name: 'Import', 
        component: Import, 
        meta: { requiresAuth: true } 
      },
      {
        path: '/financial-dashboard',
        name: 'financial-dashboard',
        component: FinancialDashboard,
        meta: { requiresAuth: true }
      },
      {
        path: '/rapports',
        name: 'Rapport',
        component: Rapport,
        meta: { requiresAuth: true }
      }
    ]
    ```

## Comptes & Consultation
- **Liste simple des comptes (boutons)**
  - Affichage de tous les comptes, navigation vers le livre de compte
  - **Fichier :** `src/components/Compte.vue`
  - **Extrait de code :**
    ```javascript
    async chargerCompte(){
        const token=sessionStorage.getItem('authToken');
        const compte=await fonction.getIDempiereModels(token,'c_elementvalue');
        this.items=compte.records
        console.log(compte);
    }
    ```
- **Liste détaillée des comptes (tableau, recherche, filtre, pagination, export)**
  - Recherche, filtre par type, pagination, export, actions (voir/modifier)
  - **Fichier :** `src/components/Rapport.vue`
- **Balance des comptes (grille, solde, recherche)**
  - Affichage du solde, total débit/crédit, recherche, navigation vers détail
  - **Fichier :** `src/components/Balance.vue`
  - **Utilitaires :** `src/js/fonction.js` (getBalancefromidcompte)

## Livre de compte (détail d'un compte)
- **Consultation des écritures d'un compte**
  - Filtres de date, affichage des transactions, totaux, export PDF/Excel
  - **Fichier :** `src/components/LivreCompte.vue`
  - **Utilitaires :** `src/js/fonction.js` (getIDempiereModelsWhereid, etc.)

## Tableau de bord financier
- **Dashboard mensuel (CA, Charges, Résultat net, graphique)**
  - Agrégation des écritures par mois, affichage tableau + graphique, filtre année
  - **Fichier :** `src/components/FinancialDashboard.vue`
  - **Utilitaires :** `src/js/fonction.js` (pour appels API si besoin)

## Utilitaires & Fonctions partagées
- **Appels API génériques, utilitaires de date, calculs**
  - Fonctions pour requêtes iDempiere, conversion de date, calculs de balance, etc.
  - **Fichier :** `src/js/fonction.js`

## Divers
- **Composants atomiques (inputs, boutons, etc.)**
  - Réutilisables dans plusieurs pages
  - **Dossier :** `src/components/atome/`
- **Assets, icônes, styles**
  - **Dossiers :** `src/assets/`, `src/components/icons/`

## Comment utiliser ce fichier
- **Pour modifier une fonctionnalité** : cherche la section correspondante, puis va dans le(s) fichier(s) indiqué(s).
- **Pour ajouter une nouvelle fonctionnalité** : repère la page ou le composant le plus proche de ce que tu veux faire, et ajoute/modifie le code dans le fichier associé.
- **Pour les fonctions partagées** (API, calculs, etc.) : ajoute dans `src/js/fonction.js` si besoin. 