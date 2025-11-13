# 🕵️ OPERATION-CRA

Application de gestion des agents secrets et des missions développée avec Angular 19+ et NgRx Signals.

![Angular](https://img.shields.io/badge/Angular-19+-DD0031?style=for-the-badge&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript)
![NgRx](https://img.shields.io/badge/NgRx-Signals-764ABC?style=for-the-badge&logo=redux)

## 📋 Table des matières

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Démarrage](#-démarrage)
- [Architecture](#-architecture)
- [Utilisation](#-utilisation)
- [Structure du projet](#-structure-du-projet)
- [Technologies](#-technologies)
- [Scripts disponibles](#-scripts-disponibles)
- [Configuration](#-configuration)
- [Contribution](#-contribution)

## 🎯 Présentation

**Operation-CRA** est une application web moderne de gestion d'agents secrets et de missions. Elle permet de :
- Suivre en temps réel le statut et la localisation des agents
- Gérer l'affectation des agents aux missions
- Visualiser une timeline interactive des missions
- Gérer les périodes de repos obligatoires des agents
- Détecter les contacts avec des doubles agents (BananaBread)

L'application utilise des données mockées stockées en LocalStorage pour simuler un backend, ce qui en fait une solution MVP idéale.

## ✨ Fonctionnalités

### Gestion des Agents
- 📊 **Liste complète** des agents avec filtrage par statut
- 🔍 **Recherche** par nickname
- 📍 **Localisation GPS** sur carte interactive (Leaflet)
- 🎭 **Statuts multiples** : OPERATIONAL, REST, DECEASED, HOSTAGE, CONTAMINATED, UNKNOWN
- ⏰ **Compte à rebours** des jours de repos restants
- 🍌 **Alerte BananaBread** pour les doubles agents contactés
- 📋 **Détails complets** : mission assignée, dates, statut

### Gestion des Missions
- 📅 **Timeline interactive** avec échelle temporelle dynamique
- 🎯 **Drag & Drop** pour assigner les agents aux missions
- 🔄 **Remplacement d'agent** avec confirmation et gestion automatique
- 📊 **Filtrage** par statut (En cours, Planifiées, Terminées)
- 📌 **Curseur de date actuelle** sur la timeline
- 🏷️ **Badges de statut** colorés pour agents et missions
- ⏱️ **Dates de début et fin** calculées automatiquement

### Interface Utilisateur
- 🎨 **Design futuriste** avec dégradés oklch()
- 🌓 **Thème sombre** optimisé
- 📱 **Responsive** avec CSS Grid
- ⚡ **Animations fluides** et transitions
- 🔔 **Notifications visuelles** pour événements importants
- 🔄 **Reset des données** en un clic

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** >= 20.x
- **npm** >= 10.x
- **Angular CLI** >= 19.x

```bash
# Vérifier les versions installées
node --version
npm --version
ng version
```

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://gitlab.com/loxnet/operation-cra.git
cd operation-cra
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration (optionnel)

Les fichiers de configuration sont déjà configurés par défaut, mais vous pouvez les modifier si nécessaire :

- **Environnements** : `src/environments/`
- **Mock Data** : `public/mock/`
- **Styles globaux** : `src/styles.scss`

## 🏃 Démarrage

### Mode développement

```bash
npm start
```

L'application sera accessible sur `http://localhost:4200/`

### Mode développement avec hot reload

```bash
ng serve --open
```

Cette commande ouvre automatiquement votre navigateur sur l'application.

### Build de production

```bash
npm run build
```

Les fichiers de build seront générés dans le dossier `dist/operation-cra/`

### Servir le build de production

```bash
npm run serve:prod
```

## 🏗️ Architecture

### Pattern NgRx Signals

L'application utilise **NgRx Signals** (v20+), la nouvelle approche de state management d'Angular :

```typescript
// Exemple de Store
export const MissionStore = signalStore(
  withState<MissionState>(initialState),
  withComputed((store) => ({
    sortedMissions: computed(() => { /* ... */ })
  })),
  withMethods((store) => ({
    assignAgent: rxMethod<{...}>(/* ... */)
  }))
);
```

### Composants Standalone

Tous les composants utilisent l'API standalone d'Angular 19+  :

```typescript
@Component({
  selector: 'app-mission-timeline',
  // standalone: true, plus nécessaire depuis la version 19, activé par défaut
  imports: [CommonModule, ...],
  templateUrl: './mission-timeline.html'
})
```

### LocalStorage comme Backend

Les données sont persistées en LocalStorage via un service dédié :

```typescript
// Lecture
const missions = localStorageService.getItem<Mission[]>('secret-missions');

// Écriture
localStorageService.setItem('secret-missions', missions);
```

## 💼 Utilisation

### Page Missions (`/missions`)

1. **Vue d'ensemble** : Timeline avec toutes les missions
2. **Filtrage** : Cliquez sur les boutons de filtre (Toutes, En cours, Planifiées, Terminées)
3. **Assignation** :
   - Faites glisser un agent de la liste de droite vers la timeline
   - Le positionnement détermine la date de début
4. **Remplacement** :
   - Si vous assignez un agent à une mission déjà occupée, une popup de confirmation apparaît
   - L'ancien agent passe automatiquement en repos pour 7 jours
5. **Reset** : Bouton "Réinitialiser les données" pour restaurer les JSON initiaux

### Page Agents (`/agents`)

1. **Liste** : Tous les agents avec leur statut
2. **Sélection** : Cliquez sur un agent pour voir ses détails
3. **Détails affichés** :
   - Statut actuel avec badge coloré
   - Mission assignée (si applicable)
   - Jours de repos restants (si en repos)
   - Alerte BananaBread (si applicable)
   - Localisation GPS sur carte

### Codes Couleur

- 🟢 **OPERATIONAL** : Disponible pour assignation
- 🔵 **REST** : En repos, compte à rebours visible
- 🟠 **HOSTAGE** : En otage, difficultés terrain
- 🟣 **CONTAMINATED** : Contaminé, difficultés terrain
- ⚪ **DECEASED** : Décédé, non assignable
- 🟡 **UNKNOWN** : Statut inconnu

## 📁 Structure du projet

```
operation-cra/
├── public/
│   └── mock/                    # Données JSON mockées
│       ├── agents.json         # Liste des agents
│       └── missions.json       # Liste des missions
├── src/
│   ├── app/
│   │   ├── core/               # Services core
│   │   │   └── services/
│   │   │       ├── local-storage.service.ts
│   │   │       └── agent-rest.service.ts
│   │   ├── features/           # Fonctionnalités métier
│   │   │   ├── missions/
│   │   │   │   ├── components/
│   │   │   │   │   ├── mission-timeline/
│   │   │   │   │   ├── operational-agent-list/
│   │   │   │   │   └── agent-replacement-dialog/
│   │   │   │   ├── stores/
│   │   │   │   │   ├── mission.store.ts
│   │   │   │   │   └── mission.interface.ts
│   │   │   │   └── mission.service.ts
│   │   │   ├── secret-agents/
│   │   │   │   ├── components/
│   │   │   │   │   ├── secret-agent-list/
│   │   │   │   │   └── secret-agent-detail/
│   │   │   │   ├── stores/
│   │   │   │   │   ├── secret-agent.store.ts
│   │   │   │   │   └── secret-agent.interface.ts
│   │   │   │   └── secret-agent.service.ts
│   │   │   ├── map/            # Composant carte Leaflet
│   │   │   └── navigation/     # Header et menu
│   │   ├── shared/             # Composants partagés
│   │   │   └── pipes/
│   │   ├── views/              # Pages principales
│   │   │   ├── home/           # Page agents
│   │   │   └── mission-dashboard/  # Page missions
│   │   └── app.routes.ts       # Configuration des routes
│   ├── environments/           # Configuration environnement
│   ├── styles.scss            # Styles globaux + variables CSS
│   └── index.html
├── angular.json               # Configuration Angular
├── package.json              # Dépendances npm
└── tsconfig.json            # Configuration TypeScript
```

## 🛠️ Technologies

### Frontend
- **Angular 19+** - Framework web moderne
- **TypeScript 5+** - JavaScript typé
- **NgRx Signals** - State management réactif
- **RxJS** - Programmation réactive

### UI/UX
- **CSS Grid** - Layout responsive
- **SCSS** - Préprocesseur CSS
- **CSS3 Variables** - Thème dynamique
- **oklch()** - Espace colorimétrique moderne
- **FontAwesome** - Icônes (manuel, sans npm)

### Cartographie
- **Leaflet** - Bibliothèque de cartes interactives
- **OpenStreetMap** - Fond de carte

### Build & Dev
- **Angular CLI** - Tooling et build
- **esbuild** - Bundler ultra-rapide
- **Vite** - Dev server performant

## 📜 Scripts disponibles

```bash
# Développement
npm start                 # Démarre le serveur de développement
npm run watch            # Mode watch avec recompilation auto

# Build
npm run build            # Build de production
npm run build:dev        # Build de développement

# Tests (si configurés)
npm test                 # Lance les tests unitaires
npm run test:watch       # Tests en mode watch
npm run e2e              # Tests end-to-end

# Qualité du code
npm run lint             # Lint avec ESLint
npm run format           # Format avec Prettier (si configuré)

# Serveur de production
npm run serve:prod       # Sert le build de production
```

## ⚙️ Configuration

### Variables d'environnement

#### `src/environments/environment.ts` (Production)
```typescript
export const environment = {
  production: true,
  backendUrl: 'http://localhost:4200/api', // conservé mais non utilisé, il convient de mettre l'url du back
  secretAgentPath: 'mock/agents.json',
  missionPath: 'mock/missions.json'
};
```

#### `src/environments/environment.development.ts` (Développement)
```typescript
export const environment = {
  production: false,
  backendUrl: 'http://localhost:4200/api', // conservé mais non utilisé
  secretAgentPath: 'mock/agents.json',
  missionPath: 'mock/missions.json'
};
```

### Variables CSS personnalisables

Dans `src/styles.scss` :

```scss
:root {
  --primary-color: 68.44% 0.292 256.45;     // Bleu primaire
  --secondary-color: 62.47% 0.243 271.16;   // Violet secondaire
  --accent-color: 68.97% 0.272 253;         // Bleu accent
  --shiny-white: 100% 0 271.152;            // Blanc brillant
  --background-color: 17, 22, 47;           // Fond sombre
  --default-text-color: 230, 230, 230;      // Texte clair
}
```

### Configuration du LocalStorage

Les clés de stockage sont définies dans les services :

```typescript
// Missions
const MISSIONS_STORAGE_KEY = 'secret-missions';

// Agents
const AGENTS_STORAGE_KEY = 'secret-agents';
```

## 📊 Modèles de données

### Agent Secret

```typescript
interface SecretAgent {
  nickname: string;
  picture?: Blob;
  lastKnownStatus: SecretAgentStatus;
  currentLocation?: GeolocationCoordinates;
  bananaBread: boolean;
  restDaysRemaining?: number;
}

enum SecretAgentStatus {
  OPERATIONAL = "OPERATIONAL",
  REST = "REST",
  DECEASED = "DECEASED",
  HOSTAGE = "HOSTAGE",
  CONTAMINATED = "CONTAMINATED",
  UNKNOWN = "UNKNOWN"
}
```

### Mission

```typescript
interface SecretMission {
  id: string;
  codeName: string;
  geolocation: GeolocationCoordinates;
  summary: string;
  status: MissionStatus;
  startDate: string;        // ISO format
  endDate: string;          // ISO format
  assignedAgentNickname: string | null;
  durationWeeks: number;
}

enum MissionStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  ABORTED = 'ABORTED',
  OVER = 'OVER'
}
```

## 🎨 Personnalisation du thème

### Modifier les couleurs

Éditez `src/styles.scss` :

```scss
:root {
  --primary-color: 68.44% 0.292 256.45;  
  --secondary-color: 62.47% 0.243 271.16;
  --accent-color: 68.97% 0.272 253;
}
```

### Ajouter de nouvelles polices

1. Ajoutez les fichiers de police dans `public/fonts/`
2. Déclarez-les dans `src/styles.scss` :

```scss
@font-face {
  font-family: 'MaPolice';
  src: url('/fonts/ma-police.woff2');
}
```

### Modifier les icônes

Les icônes utilisent FontAwesome en mode manuel. Pour changer une icône :

```html
<!-- Avant -->
<i class="fas fa-user-secret"></i>

<!-- Après -->
<i class="fas fa-spy"></i>
```

Liste des classes : [FontAwesome Icons](https://fontawesome.com/icons)

## 🐛 Dépannage

### L'application ne démarre pas

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Erreur de providers

Si vous voyez `NG0201: No provider found for SignalStore`, vérifiez que le store est fourni :

```typescript
@Component({
  providers: [MissionStore]  // Ajoutez le store
})
```

### Erreur de carte non affichée

Vérifiez que Leaflet est bien installé :

```bash
npm install leaflet
npm install --save-dev @types/leaflet
```

### Build échoue avec des erreurs CSS

Les warnings de budget CSS sont normaux. Pour les supprimer, éditez `angular.json` :

```json
"budgets": [
  {
    "type": "anyComponentStyle",
    "maximumWarning": "10kb"
  }
]
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment procéder :

1. **Fork** le projet
2. **Créez** une branche pour votre fonctionnalité (`git checkout -b feature/ma-feature`)
3. **Committez** vos changements (`git commit -m 'feat: ajout de ma feature'`)
4. **Pushez** vers la branche (`git push origin feature/ma-feature`)
5. **Ouvrez** une Pull Request

### Convention de commits

Utilisez le format [Conventional Commits](https://www.conventionalcommits.org/) :

```
feat: ajout du drag & drop
fix: correction du calcul de dates
docs: mise à jour du README
style: formatage du code
refactor: restructuration du store
test: ajout de tests unitaires
```

## Construction de l'image docker

Le projet contient un dockerfile permettant la construction d'une image basée sur nginx/alpine
La construction en 2 temps permet la compilation en mode production du projet angular via une image node:22.

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteurs

- **Loxnet** - *Développement initial* - [GitLab](https://github.com/loxnet)

## 🙏 Remerciements

- Angular Team pour le framework
- NgRx Team pour Signals
- Leaflet pour la cartographie
- FontAwesome pour les icônes
- Spy Party pour l'inspiration du concept BananaBread

---

**Made with ❤️ and ☕ by Loxnet**

Pour toute question ou support, ouvrez une issue sur GitLab.
