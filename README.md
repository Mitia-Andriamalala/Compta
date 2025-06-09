# Application de Comptabilité

## Description
Application de gestion comptable développée avec Vue.js 3, permettant la gestion des comptes, l'import de données, le suivi des transactions et l'analyse financière en temps réel.

## Structure des Données

### 1. Écritures Comptables (fichier1.csv)
- **Structure**
  - date : Date de l'opération
  - reference : Référence unique de l'opération
  - journal : Code du journal (ex: OD)
  - compte : Numéro de compte
  - debit : Montant au débit
  - credit : Montant au crédit

### 2. Plan Comptable (fichier2.csv)
- **Structure**
  - compte : Numéro de compte
  - libelle : Libellé du compte

## Fonctionnalités Essentielles

### 1. Gestion des Écritures Comptables
- **Import des Données**
  - Import des fichiers CSV
  - Validation du format des données
  - Vérification des équilibres débit/crédit
  - Détection des erreurs de format

- **Suivi des Opérations**
  - Journal des opérations chronologique
  - Regroupement par référence
  - Filtrage par date
  - Filtrage par compte
  - Filtrage par journal

### 2. Gestion des Comptes
- **Types de Comptes Gérés**
  - Clients (411xx)
    - Suivi des créances clients
    - Historique des transactions
  - Fournisseurs (401xx)
    - Suivi des dettes fournisseurs
    - Historique des transactions
  - TVA (445xx)
    - TVA déductible (44566)
    - TVA collectée (44571)
  - Banque (512xx)
    - Suivi des mouvements bancaires
    - Solde en temps réel
  - Charges (607xx)
    - Suivi des achats
    - Analyse des dépenses
  - Produits (701xx)
    - Suivi des ventes
    - Analyse des revenus

### 3. Analyses Financières
- **Analyse par Compte**
  - Mouvements débit/crédit
  - Soldes périodiques
  - Évolution des soldes
  - Historique des transactions

- **Analyse par Journal**
  - Total des opérations
  - Répartition des écritures
  - Contrôle des totaux

### 4. Tableau de Bord
- **Indicateurs Clés**
  - Total des ventes (70100)
  - Total des achats (60700)
  - TVA collectée (44571)
  - TVA déductible (44566)
  - Solde bancaire (51200)
  - Créances clients (41101)
  - Dettes fournisseurs (40110)

- **Graphiques**
  - Évolution des ventes
  - Évolution des achats
  - Évolution de la TVA
  - Évolution de la trésorerie

### 5. États Comptables
- **Balance**
  - Balance générale
  - Balance auxiliaire
  - Soldes par compte
  - Mouvements par période

- **Grand Livre**
  - Mouvements par compte
  - Historique complet
  - Filtrage par période
  - Filtrage par référence

### 6. Export et Rapports
- **Formats d'Export**
  - CSV
  - PDF
  - Excel

- **Types de Rapports**
  - Journal des opérations
  - Grand livre
  - Balance
  - États de TVA

## Technologies Utilisées
- Vue.js 3
- Vite
- Vue Router
- Axios
- PapaParse
- Chart.js
- TailwindCSS

## Prérequis
- Node.js (version récente)
- NPM ou Yarn

## Installation
1. Cloner le projet
2. Installer les dépendances :
```bash
npm install
```

## Démarrage
### Développement
```bash
npm run dev
```

### Production
```bash
npm run build
npm run preview
```

## Structure du Projet
```
/src
  /assets         # Ressources statiques
  /components     # Composants Vue.js
    /atome        # Composants atomiques
    /icons        # Icônes
  /js             # Utilitaires JavaScript
  /queries        # Requêtes et logique métier
  App.vue         # Composant racine
  main.js         # Point d'entrée
  router.js       # Configuration des routes
```

## Contribution
Pour contribuer au projet :
1. Créer une branche
2. Effectuer les modifications
3. Soumettre une pull request
4. Suivre les conventions de code

## Licence
Tous droits réservés

## Fonctionnalités à Développer

### Gestion Commerciale
#### Gestion des Clients
- Base de données clients complète
- Historique des transactions par client
- Suivi des encours clients
- Échelonnement des paiements
- Gestion des relances automatiques
- Analyse de la rentabilité client
- Gestion des remises et ristournes
- Suivi des litiges
- Gestion des contrats clients
- Historique des communications

#### Gestion des Fournisseurs
- Base de données fournisseurs
- Suivi des commandes fournisseurs
- Gestion des délais de paiement
- Analyse des performances fournisseurs
- Gestion des litiges fournisseurs
- Suivi des contrats fournisseurs
- Gestion des approvisionnements
- Évaluation des fournisseurs

#### Gestion des Produits et Services
- Catalogue de produits/services
- Gestion des prix et tarifs
- Suivi des stocks
- Gestion des coûts de revient
- Analyse de la marge par produit
- Gestion des promotions
- Suivi des produits obsolètes
- Gestion des nomenclatures

### Gestion des Opérations Commerciales
#### Facturation
- Génération automatique des factures
- Gestion des devis
- Suivi des commandes
- Gestion des avoirs
- Facturation récurrente
- Gestion des acomptes
- Facturation multi-devises
- Templates de factures personnalisables

#### Achats
- Gestion des demandes d'achat
- Suivi des commandes fournisseurs
- Gestion des réceptions
- Contrôle qualité
- Gestion des retours
- Suivi des délais de livraison

### Gestion des Ressources Humaines
- Gestion des salaires
- Suivi des congés
- Gestion des contrats
- Suivi des formations
- Gestion des notes de frais
- Suivi des objectifs
- Gestion des plannings
- Intégration avec la paie

### Gestion des Projets
- Suivi des projets
- Gestion des budgets projets
- Suivi des temps
- Analyse de rentabilité
- Gestion des ressources
- Suivi des jalons
- Reporting projet

### Gestion des Immobilisations
- Suivi des immobilisations
- Calcul des amortissements
- Gestion des maintenances
- Suivi des locations
- Gestion des assurances
- Planification des renouvellements

### Gestion de la Trésorerie
- Prévisions de trésorerie
- Gestion des emprunts
- Suivi des placements
- Gestion des effets
- Optimisation des flux
- Gestion des garanties
- Suivi des ratios de trésorerie

### Gestion des Taxes et Obligations Fiscales
- Calcul automatique de la TVA
- Gestion des déclarations fiscales
- Suivi des obligations légales
- Gestion des acomptes
- Suivi des contrôles fiscaux
- Gestion des exonérations

### Business Intelligence
- Tableaux de bord personnalisés
- Analyse prédictive
- Rapports avancés
- KPIs personnalisables
- Analyse comparative
- Alertes intelligentes
- Export de données avancé

### Intégrations
- Interface avec les banques
- Synchronisation avec les ERP
- Intégration avec les outils de CRM
- Connexion avec les plateformes e-commerce
- API pour développeurs tiers
- Synchronisation avec les outils de gestion de stock
- Intégration avec les systèmes de paie

### Sécurité et Conformité Avancée
- Signature électronique des documents
- Archivage légal
- Conformité aux normes internationales
- Gestion des droits d'accès avancée
- Journalisation détaillée
- Protection contre la fraude
- Sauvegarde multi-sites

### Mobile et Accessibilité
- Application mobile
- Interface responsive
- Notifications push
- Accès hors ligne
- Synchronisation mobile
- Signature électronique mobile
- Scanner de documents

Ces fonctionnalités permettront de transformer le système en une solution complète de gestion d'entreprise, couvrant tous les aspects de la gestion commerciale, financière et administrative.

### Calculs Comptables et Financiers Essentiels

#### Calculs de Base Comptables
- **Calculs de Soldes**
  - Solde initial
  - Solde intermédiaire
  - Solde final
  - Solde débiteur/créditeur
  - Solde reporté
  - Solde à nouveau

- **Calculs de Mouvements**
  - Débits totaux
  - Crédits totaux
  - Mouvements nets
  - Écritures de contrepassation
  - Écritures d'ajustement
  - Écritures de régularisation

#### Calculs Financiers
- **Calculs de Trésorerie**
  - Trésorerie nette
  - Besoin en fonds de roulement (BFR)
  - Fonds de roulement net global (FRNG)
  - Capacité d'autofinancement (CAF)
  - Excédent de trésorerie d'exploitation (ETE)
  - Flux de trésorerie disponible

- **Calculs de Rentabilité**
  - Marge brute
  - Marge nette
  - Taux de marge
  - Taux de rentabilité
  - Point mort
  - Seuil de rentabilité
  - ROI (Return on Investment)
  - ROE (Return on Equity)

#### Calculs Fiscaux
- **Calculs de TVA**
  - TVA collectée
  - TVA déductible
  - TVA à payer
  - TVA à décaisser
  - TVA à récupérer
  - Régularisations de TVA

- **Calculs d'Impôts**
  - Impôt sur les bénéfices
  - Impôt différé
  - Impôt anticipé
  - Cotisations sociales
  - Taxes diverses
  - Acomptes d'impôt

#### Calculs d'Amortissement
- **Amortissements Linéaires**
  - Base amortissable
  - Taux d'amortissement
  - Dotation annuelle
  - Valeur nette comptable
  - Amortissement cumulé

- **Amortissements Dégressifs**
  - Coefficient fiscal
  - Taux dégressif
  - Dotation dégressive
  - Réajustement annuel

#### Calculs de Provisions
- **Provisions pour Dépréciation**
  - Provisions pour stocks
  - Provisions pour créances
  - Provisions pour titres
  - Provisions pour charges

- **Provisions pour Risques**
  - Provisions pour litiges
  - Provisions pour garanties
  - Provisions pour restructuration
  - Provisions pour pensions

#### Calculs de Consolidation
- **Agrégats Comptables**
  - Consolidation des bilans
  - Consolidation des comptes de résultat
  - Élimination des opérations intra-groupe
  - Retraitements fiscaux
  - Conversion des devises

#### Calculs de Performance
- **Ratios Financiers**
  - Ratios de liquidité
  - Ratios de solvabilité
  - Ratios de rentabilité
  - Ratios d'activité
  - Ratios de structure

- **Indicateurs de Gestion**
  - Rotation des stocks
  - Délai de paiement clients
  - Délai de paiement fournisseurs
  - Durée du cycle d'exploitation
  - Taux de couverture des charges fixes

#### Calculs de Coûts
- **Coûts de Revient**
  - Coût d'achat
  - Coût de production
  - Coût de distribution
  - Coût complet
  - Coût marginal

- **Analyse des Coûts**
  - Coûts directs/indirects
  - Coûts fixes/variables
  - Coûts par activité
  - Coûts par produit
  - Coûts par client

#### Calculs de Budget
- **Budgets Prévisionnels**
  - Budget de trésorerie
  - Budget d'exploitation
  - Budget d'investissement
  - Budget de financement
  - Budget de production

- **Suivi Budgétaire**
  - Écarts budgétaires
  - Analyse des variances
  - Révisions budgétaires
  - Prévisions actualisées

#### Calculs de Valorisation
- **Valorisation des Actifs**
  - Valeur d'acquisition
  - Valeur nette comptable
  - Valeur de marché
  - Valeur d'utilité
  - Valeur de liquidation

- **Valorisation des Passifs**
  - Valeur actuelle
  - Valeur de remboursement
  - Coût amorti
  - Juste valeur

#### Calculs de Performance Sociale
- **Indicateurs Sociaux**
  - Masse salariale
  - Coût du personnel
  - Productivité
  - Taux d'absentéisme
  - Taux de turnover

#### Calculs de Conformité
- **Indicateurs Réglementaires**
  - Ratios prudentiels
  - Ratios de solvabilité
  - Ratios de liquidité
  - Ratios de levier
  - Ratios de couverture

Ces calculs forment la base d'un système comptable et financier complet, permettant une gestion précise et conforme aux normes comptables et fiscales en vigueur.

## Fonctionnalités Futures (Phase 2)
[Les autres fonctionnalités détaillées précédemment seront développées dans une phase ultérieure]

        