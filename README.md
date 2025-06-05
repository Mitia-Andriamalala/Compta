
# Application de Comptabilité

## Description
Application de gestion comptable développée avec Vue.js 3, permettant la gestion des comptes, l'import de données et le suivi des transactions.

## Technologies Utilisées
- Vue.js 3
- Vite
- Vue Router
- Axios
- PapaParse

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

### Composants Principaux
- `Login.vue` : Gestion de l'authentification
- `NavBar.vue` : Navigation principale
- `Compte.vue` : Liste et gestion des comptes
- `LivreCompte.vue` : Détail des transactions par compte
- `Balance.vue` : Vue d'ensemble de la balance
- `Import.vue` : Import des données CSV

### Fonctionnalités

#### Authentification
- Système de login sécurisé
- Protection des routes sensibles
- Gestion des sessions par token

#### Gestion des Comptes
- Consultation de la liste des comptes
- Navigation intuitive
- Affichage détaillé des transactions

#### Import de Données
- Support des fichiers CSV
- Validation des données
- Prévisualisation avant import

#### Reporting
- Balance comptable
- Livre de comptes avec filtres par date
- Calculs automatiques des soldes

### Organisation des Fichiers
```
/src
  /assets         # Ressources statiques
  /components     # Composants Vue.js
  /js             # Utilitaires JavaScript
  App.vue         # Composant racine
  main.js         # Point d'entrée
  router.js       # Configuration des routes
```

## Sécurité
- Routes protégées
- Validation des données
- Gestion sécurisée des sessions

## Base de Données
- Fichier `initialiseCompte.sql` pour la configuration initiale

## Développement

### Scripts Disponibles
- `npm run dev` : Mode développement
- `npm run build` : Build production
- `npm run preview` : Prévisualisation production

### Configuration
- `vite.config.js` : Configuration de Vite
- `jsconfig.json` : Configuration JavaScript

## Contribution
Pour contribuer au projet :
1. Créer une branche
2. Effectuer les modifications
3. Soumettre une pull request

## Licence
Tous droits réservés

        