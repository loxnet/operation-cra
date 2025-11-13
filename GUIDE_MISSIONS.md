# Guide d'utilisation - Système de Missions et Agents

Ce guide explique comment utiliser le système d'assignation des agents aux missions avec NgRx Signals et LocalStorage.

## 📋 Table des matières

- [Architecture](#architecture)
- [Utilisation des Stores](#utilisation-des-stores)
- [Règles métier](#règles-métier)
- [Exemples d'utilisation](#exemples-dutilisation)
- [LocalStorage](#localstorage)

## 🏗️ Architecture

### Fichiers créés/modifiés

```
src/
├── app/
│   ├── core/
│   │   └── services/
│   │       └── local-storage.service.ts          (NOUVEAU)
│   ├── features/
│   │   ├── missions/
│   │   │   ├── mission.service.ts                (NOUVEAU)
│   │   │   └── stores/
│   │   │       ├── mission.interface.ts          (MODIFIÉ)
│   │   │       └── mission.store.ts              (NOUVEAU)
│   │   └── secret-agents/
│   │       ├── secret-agent.service.ts           (MODIFIÉ)
│   │       └── stores/
│   │           ├── secret-agent.interface.ts     (MODIFIÉ)
│   │           └── secret-agent.store.ts         (MODIFIÉ)
│   └── environments/
│       ├── environment.ts                        (MODIFIÉ)
│       └── environment.development.ts            (MODIFIÉ)
└── public/
    └── mock/
        └── missions.json                         (NOUVEAU)
```

## 📦 Utilisation des Stores

### SecretAgentStore - Fonctionnalités de recherche

```typescript
import { SecretAgentStore } from './features/secret-agents/stores/secret-agent.store';

@Component({
  // ...
  providers: [SecretAgentStore]
})
export class AgentListComponent {
  readonly agentStore = inject(SecretAgentStore);

  ngOnInit() {
    // Charger les agents
    this.agentStore.loadAgents();
  }

  // Recherche textuelle
  searchAgents(query: string) {
    this.agentStore.setSearchQuery(query);
    // Les agents filtrés sont automatiquement mis à jour via le computed
    console.log(this.agentStore.filteredAgents());
  }

  // Filtrer par statut
  filterByStatus(status: SecretAgentStatus | null) {
    this.agentStore.setStatusFilter(status);
  }

  // Effacer les filtres
  clearFilters() {
    this.agentStore.clearFilters();
  }

  // Sélectionner un agent
  selectAgent(nickname: string) {
    this.agentStore.selectAgent(nickname);
    console.log(this.agentStore.selectedAgent());
  }

  // Mettre à jour le statut d'un agent
  updateAgentStatus(nickname: string, status: SecretAgentStatus) {
    this.agentStore.updateAgentStatus({ nickname, status });
  }

  // Récupérer les statistiques
  getStatistics() {
    console.log(this.agentStore.statistics());
    // {
    //   total: 20,
    //   operational: 4,
    //   deceased: 2,
    //   hostage: 2,
    //   contaminated: 2,
    //   atRest: 6,
    //   unknown: 4,
    //   requiresAttention: 3
    // }
  }
}
```

### MissionStore - Assignation des agents

```typescript
import { MissionStore } from './features/missions/stores/mission.store';
import { SecretAgentStore } from './features/secret-agents/stores/secret-agent.store';

@Component({
  // ...
  providers: [MissionStore, SecretAgentStore]
})
export class MissionManagementComponent {
  readonly missionStore = inject(MissionStore);
  readonly agentStore = inject(SecretAgentStore);

  ngOnInit() {
    // Charger les missions et agents
    this.missionStore.loadMissions();
    this.agentStore.loadAgents();
  }

  // Assigner un agent à une mission
  assignAgentToMission(missionId: string, agentNickname: string) {
    // Récupérer le statut de l'agent
    const agent = this.agentStore.agents().find(a => a.nickname === agentNickname);

    if (!agent) {
      console.error('Agent introuvable');
      return;
    }

    // Assigner l'agent (les règles métier sont vérifiées dans le store)
    this.missionStore.assignAgent({
      missionId,
      agentNickname,
      agentStatus: agent.lastKnownStatus
    });
  }

  // Désassigner un agent
  unassignAgent(missionId: string) {
    this.missionStore.unassignAgent(missionId);
  }

  // Mettre à jour le statut d'une mission
  updateMissionStatus(missionId: string, status: MissionStatus) {
    this.missionStore.updateStatus({ missionId, status });
  }

  // Obtenir les missions disponibles (sans agent)
  getAvailableMissions() {
    console.log(this.missionStore.availableMissions());
  }

  // Obtenir les agents opérationnels
  getOperationalAgents() {
    console.log(this.agentStore.operationalAgents());
  }

  // Obtenir les statistiques des missions
  getMissionStatistics() {
    console.log(this.missionStore.statistics());
    // {
    //   total: 3,
    //   inProgress: 1,
    //   planned: 2,
    //   aborted: 0,
    //   over: 0,
    //   withAgent: 1,
    //   withoutAgent: 2
    // }
  }

  // Récupérer la mission assignée à un agent
  getAgentCurrentMission(agentNickname: string) {
    console.log(this.missionStore.getMissionByAgent(agentNickname)());
  }
}
```

## ⚖️ Règles métier

### Assignation d'un agent à une mission

1. **Statut de l'agent** : Seuls les agents avec le statut `OPERATIONAL` peuvent être assignés
2. **Unicité** : Un agent ne peut être assigné qu'à **une seule mission à la fois**
3. **Disponibilité de la mission** : Une mission ne peut avoir qu'**un seul agent assigné**
4. **Durée** : L'assignation calcule automatiquement la date de fin basée sur `durationWeeks`
5. **Changement de statut** : Quand un agent est assigné, la mission passe à `IN_PROGRESS`

### Période de repos

Selon vos besoins, la durée est définie en **semaines**. Après une mission, vous devriez :
- Mettre l'agent au statut `REST`
- Attendre 7 jours (1 semaine) avant de le réassigner

Cette logique peut être implémentée dans votre composant :

```typescript
canAssignAgent(agent: SecretAgent, lastMissionEndDate?: string): boolean {
  if (agent.lastKnownStatus !== SecretAgentStatus.OPERATIONAL) {
    return false;
  }

  if (agent.lastKnownStatus === SecretAgentStatus.REST && lastMissionEndDate) {
    const endDate = new Date(lastMissionEndDate);
    const now = new Date();
    const daysSinceEnd = (now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24);

    // L'agent doit se reposer au moins 7 jours
    if (daysSinceEnd < 7) {
      return false;
    }
  }

  return true;
}
```

## 💾 LocalStorage

### Clés utilisées

- `secret-agents` : Liste des agents secrets
- `secret-missions` : Liste des missions

### Fonctionnement

1. **Premier chargement** : Les données sont chargées depuis les fichiers JSON (`mock/agents.json`, `mock/missions.json`)
2. **Chargements suivants** : Les données proviennent du LocalStorage
3. **Modifications** : Toutes les modifications (assignation, changement de statut, etc.) sont sauvegardées automatiquement

### Réinitialisation

Pour revenir aux données initiales :

```typescript
// Réinitialiser les agents
this.agentStore.resetAgents();

// Réinitialiser les missions
this.missionStore.resetMissions();
```

Ou manuellement via la console du navigateur :
```javascript
localStorage.removeItem('secret-agents');
localStorage.removeItem('secret-missions');
// Puis rafraîchir la page
```

## 🎯 Exemples d'utilisation

### Exemple complet dans un composant

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { MissionStore } from './features/missions/stores/mission.store';
import { SecretAgentStore } from './features/secret-agents/stores/secret-agent.store';
import { SecretAgentStatus } from './features/secret-agents/stores/secret-agent.interface';
import { MissionStatus } from './features/missions/stores/mission.interface';

@Component({
  selector: 'app-mission-dashboard',
  standalone: true,
  providers: [MissionStore, SecretAgentStore],
  template: `
    <div>
      <h2>Missions disponibles</h2>
      @for (mission of missionStore.availableMissions(); track mission.id) {
        <div>
          <h3>{{ mission.codeName }}</h3>
          <p>{{ mission.summary }}</p>
          <button (click)="showAssignDialog(mission.id)">
            Assigner un agent
          </button>
        </div>
      }

      <h2>Agents opérationnels</h2>
      <input
        type="text"
        placeholder="Rechercher un agent..."
        (input)="searchAgents($event)"
      />

      @for (agent of agentStore.filteredAgents(); track agent.nickname) {
        <div>
          {{ agent.nickname }} - {{ agent.lastKnownStatus }}
          @if (agent.lastKnownStatus === 'OPERATIONAL') {
            <button (click)="assignToFirstAvailableMission(agent.nickname)">
              Assigner à une mission
            </button>
          }
        </div>
      }

      <h2>Statistiques</h2>
      <div>
        <p>Missions en cours: {{ missionStore.statistics().inProgress }}</p>
        <p>Agents opérationnels: {{ agentStore.statistics().operational }}</p>
        <p>Missions disponibles: {{ missionStore.statistics().withoutAgent }}</p>
      </div>
    </div>
  `
})
export class MissionDashboardComponent implements OnInit {
  readonly missionStore = inject(MissionStore);
  readonly agentStore = inject(SecretAgentStore);

  ngOnInit() {
    this.missionStore.loadMissions();
    this.agentStore.loadAgents();
  }

  searchAgents(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.agentStore.setSearchQuery(query);
  }

  showAssignDialog(missionId: string) {
    // Afficher un dialog avec la liste des agents opérationnels
    const operationalAgents = this.agentStore.operationalAgents();
    console.log('Agents disponibles:', operationalAgents);
  }

  assignToFirstAvailableMission(agentNickname: string) {
    const availableMission = this.missionStore.availableMissions()[0];

    if (!availableMission) {
      alert('Aucune mission disponible');
      return;
    }

    const agent = this.agentStore.agents().find(a => a.nickname === agentNickname);

    if (!agent) {
      alert('Agent introuvable');
      return;
    }

    this.missionStore.assignAgent({
      missionId: availableMission.id,
      agentNickname,
      agentStatus: agent.lastKnownStatus
    });
  }
}
```

## 🔄 Workflow typique

1. **Initialisation** : Charger les agents et missions
2. **Recherche** : Utiliser les filtres et la recherche pour trouver des agents
3. **Vérification** : Vérifier qu'un agent est `OPERATIONAL`
4. **Assignation** : Assigner l'agent à une mission disponible
5. **Suivi** : Surveiller l'état des missions en cours
6. **Fin de mission** : Mettre à jour le statut de la mission (`OVER` ou `ABORTED`)
7. **Repos** : Mettre l'agent au statut `REST` après une mission
8. **Réactivation** : Après 7 jours, remettre l'agent à `OPERATIONAL`

## 🛠️ API des Stores

### SecretAgentStore

**Signals (state)**
- `agents()` : Liste de tous les agents
- `filter()` : Filtre de statut actuel
- `searchQuery()` : Requête de recherche
- `isLoading()` : État de chargement
- `error()` : Message d'erreur

**Computed**
- `filteredAgents()` : Agents filtrés par statut et recherche
- `operationalAgents()` : Agents opérationnels uniquement
- `selectedAgent()` : Agent actuellement sélectionné
- `statistics()` : Statistiques par statut

**Methods (async)**
- `loadAgents()` : Charger les agents
- `updateAgentStatus({ nickname, status })` : Mettre à jour un statut
- `updateAgentLocation({ nickname, location })` : Mettre à jour la position
- `resetAgents()` : Réinitialiser depuis le mock

**Methods (sync)**
- `setStatusFilter(status)` : Définir le filtre
- `setSearchQuery(query)` : Définir la recherche
- `selectAgent(nickname)` : Sélectionner un agent
- `clearFilters()` : Effacer filtres et recherche
- `clearError()` : Effacer l'erreur

### MissionStore

**Signals (state)**
- `missions()` : Liste de toutes les missions
- `isLoading()` : État de chargement
- `error()` : Message d'erreur
- `selectedMissionId()` : ID de la mission sélectionnée

**Computed**
- `sortedMissions()` : Missions triées par statut
- `assignedMissions()` : Missions avec agent
- `availableMissions()` : Missions sans agent
- `activeMissions()` : Missions en cours
- `plannedMissions()` : Missions planifiées
- `selectedMission()` : Mission sélectionnée
- `statistics()` : Statistiques des missions

**Methods (async)**
- `loadMissions()` : Charger les missions
- `assignAgent({ missionId, agentNickname, agentStatus })` : Assigner un agent
- `unassignAgent(missionId)` : Désassigner un agent
- `updateStatus({ missionId, status })` : Mettre à jour le statut
- `resetMissions()` : Réinitialiser depuis le mock

**Methods (sync)**
- `selectMission(missionId)` : Sélectionner une mission
- `getMissionById(missionId)` : Récupérer une mission par ID (computed)
- `getMissionByAgent(agentNickname)` : Récupérer la mission d'un agent (computed)
- `clearError()` : Effacer l'erreur

## 🚀 Prochaines étapes

1. Créer les composants UI pour l'assignation
2. Implémenter la logique de repos de 7 jours
3. Ajouter des notifications pour les erreurs
4. Créer un tableau de bord avec les statistiques
5. Implémenter l'historique des assignations
