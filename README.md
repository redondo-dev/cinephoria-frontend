# 🎬 Cinephoria - Frontend

Application web moderne de gestion et réservation de cinéma développée avec Angular 19.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Développement](#développement)
- [Build](#build)
- [Tests](#tests)
- [Structure du projet](#structure-du-projet)
- [Technologies utilisées](#technologies-utilisées)

## 🎯 Vue d'ensemble

Cinephoria est une plateforme complète de gestion de cinéma offrant :
- 👥 **Interface utilisateur** : Consultation des films, réservation de places, gestion de compte
- 👨‍💼 **Interface employé** : Gestion des séances, salles et avis clients
- 🔐 **Interface administrateur** : Gestion complète (films, employés, salles, séances)

## ✨ Fonctionnalités

### Espace Client
- 🎥 Consultation du catalogue de films
- 🎫 Réservation de places avec sélection de sièges
- 💳 Paiement en ligne (Carte bancaire & PayPal)
- 📱 Génération de QR codes pour les réservations
- ⭐ Système d'avis et notation des films
- 👤 Gestion du profil et historique des commandes

### Espace Employé
- 📊 Dashboard dédié aux employés
- 🎬 Gestion des films et séances
- 🏛️ Gestion des salles
- 💬 Modération des avis clients

### Espace Administrateur
- 📈 Dashboard administratif avec statistiques
- 👥 Gestion des employés
- 🎞️ CRUD complet des films
- 🪑 Gestion des salles et configurations
- 🕐 Planning des séances

## 🏗️ Architecture

### Structure modulaire
```
src/app/
├── components/          # Composants par fonctionnalité
│   ├── admin/          # Module administrateur
│   ├── employes/       # Module employés
│   ├── users/          # Module utilisateurs
│   ├── films/          # Gestion des films
│   ├── reservation/    # Processus de réservation
│   └── seances/        # Gestion des séances
├── core/               # Services et modèles centraux
│   ├── guards/         # Guards d'authentification
│   ├── interceptors/   # Intercepteurs HTTP
│   ├── models/         # Modèles de données
│   └── services/       # Services métier
└── shared/             # Composants partagés
    ├── navbar/
    └── footer/
```

### Système de routing
- Routing lazy-loading pour optimiser les performances
- Guards pour la protection des routes par rôle
- Routes dédiées pour chaque espace (admin, employé, client)

### Gestion des états
- Services centralisés pour la gestion des données
- Intercepteurs HTTP pour l'authentification
- Gestion des erreurs globale

## 🔧 Prérequis

- Node.js (v18 ou supérieur)
- npm (v9 ou supérieur)
- Angular CLI 19.2.18

## 📦 Installation

1. Cloner le repository
```bash
git clone https://github.com/votre-repo/cinephoria-frontend.git
cd cinephoria-frontend
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les environnements
```bash
# Éditer src/environments/environment.ts pour le développement
# Éditer src/environments/environment.prod.ts pour la production
```

## 🚀 Développement

### Démarrer le serveur de développement
```bash
ng serve
```
ou
```bash
npm start
```

L'application sera accessible sur `http://localhost:4200/`

### Génération de composants
```bash
# Générer un composant
ng generate component components/nom-composant

# Générer un service
ng generate service core/services/nom-service

# Générer un guard
ng generate guard core/guards/nom-guard
```

## 🏭 Build

### Build de développement
```bash
npm run watch
```

### Build de production
```bash
npm run build
```

Les fichiers de build seront générés dans le dossier `dist/`.

### Optimisations de production
- Minification du code
- Tree-shaking
- AOT compilation
- Lazy loading des modules

## 🧪 Tests

### Tests unitaires
```bash
npm test
```

Exécute les tests avec Karma et Jasmine.

### Couverture de code
```bash
ng test --code-coverage
```

## 📁 Structure du projet

```
cinephoria-frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── admin/           # Gestion administration
│   │   │   ├── employes/        # Interface employés
│   │   │   ├── users/           # Espace utilisateur
│   │   │   ├── films/           # Catalogue films
│   │   │   ├── reservation/     # Système de réservation
│   │   │   │   ├── payment/     # Paiements
│   │   │   │   ├── seat-selection/  # Sélection sièges
│   │   │   │   └── success/     # Confirmation
│   │   │   ├── seances/         # Séances
│   │   │   ├── contact/         # Page contact
│   │   │   ├── home/            # Page d'accueil
│   │   │   ├── login/           # Connexion
│   │   │   └── register/        # Inscription
│   │   ├── core/
│   │   │   ├── guards/          # Guards d'authentification
│   │   │   │   ├── admin.guard.ts
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── employee.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/    # Intercepteurs HTTP
│   │   │   ├── models/          # Modèles TypeScript
│   │   │   └── services/        # Services métier
│   │   ├── shared/              # Composants partagés
│   │   ├── app.config.ts        # Configuration app
│   │   └── app.routes.ts        # Routes principales
│   ├── environments/            # Configuration environnements
│   ├── styles.scss              # Styles globaux
│   └── index.html               # Point d'entrée HTML
├── public/                      # Assets statiques
├── angular.json                 # Configuration Angular
├── package.json                 # Dépendances npm
└── tsconfig.json               # Configuration TypeScript
```

## 🛠️ Technologies utilisées

### Framework & Core
- **Angular 19.2** - Framework principal
- **TypeScript 5.7** - Langage de programmation
- **RxJS 7.8** - Programmation réactive

### UI & Styling
- **SCSS** - Préprocesseur CSS
- **Angular Animations** - Animations

### Fonctionnalités
- **angularx-qrcode** - Génération de QR codes
- **Chart.js** - Graphiques et statistiques
- **ngx-toastr** - Notifications toast

### Testing
- **Jasmine** - Framework de tests
- **Karma** - Test runner

### Build & Development
- **Angular CLI** - Outils de développement
- **Webpack** - Module bundler (via Angular CLI)

## 🔐 Sécurité

- Authentification JWT via intercepteurs
- Guards pour la protection des routes
- Gestion des rôles (Admin, Employé, Client)
- Validation des formulaires
- Protection CSRF

## 🌐 API Backend

L'application communique avec une API REST backend. Configurer l'URL de l'API dans les fichiers d'environnement :

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```
## Documentations
- 📖 **Lire la documentation technique** (pour les développeurs)
- 👥 **Lire le manuel d'utilisation** ([en Markdown](./docs/manuel-utilisation.md) | [en PDF](./docs/manuel_utilisateur_cinephoria.pdf))

## 📝 Licence

Ce projet est sous licence MIT.

## 👥 Auteurs

Développé avec ❤️ par RIAD reda fethi 

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter moi riad.reda.fethi@gmail.com

---

**Version**: 1.0.0  
**Dernière mise à jour**: 20/11/2025


