import { signalStore, withMethods, withState, withComputed, patchState } from '@ngrx/signals';
import { SecretAgentState, SecretAgentStatus } from './secret-agent.interface';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { SecretAgentService } from '../secret-agent.service';

const initialState: SecretAgentState = {
  agents: [],
  isLoading: false,
  error: null,
  filter: null, // null = tous les agents
  searchQuery: '',
  selectedAgentNickname: null,
};

export const SecretAgentStore = signalStore(

  withState<SecretAgentState>(initialState),
  withComputed((store) => ({
    /**
     * Agents filtrés par statut ET recherche textuelle
     */
    filteredAgents: computed(() => {
      const agents = store.agents();
      const filter = store.filter();
      const searchQuery = store.searchQuery().toLowerCase().trim();

      // Filtrer par statut
      let result = filter ? agents.filter((a) => a.lastKnownStatus === filter) : agents;

      // Filtrer par recherche textuelle (nickname)
      if (searchQuery) {
        result = result.filter((a) => a.nickname.toLowerCase().includes(searchQuery));
      }

      // Tri par statut (ordre alphabétique)
      result.sort((a, b) => a.lastKnownStatus.localeCompare(b.lastKnownStatus));

      return result;
    }),

    /**
     * Agents opérationnels uniquement (pour assignation aux missions)
     */
    operationalAgents: computed(() => {
      return store.agents().filter((a) => a.lastKnownStatus === SecretAgentStatus.OPERATIONAL);
    }),

    /**
     * Agents disponibles (opérationnels ET sans mission en cours)
     * Note: Cette logique nécessite une intégration avec le MissionStore
     */
    availableAgents: computed(() => {
      return store.agents().filter((a) => a.lastKnownStatus === SecretAgentStatus.OPERATIONAL);
    }),

    /**
     * Agent sélectionné
     */
    selectedAgent: computed(() => {
      const nickname = store.selectedAgentNickname();
      if (!nickname) return null;
      return store.agents().find(a => a.nickname === nickname) || null;
    }),

    /**
     * Statistiques des agents par statut
     */
    statistics: computed(() => {
      const agents = store.agents();
      return {
        total: agents.length,
        operational: agents.filter(a => a.lastKnownStatus === SecretAgentStatus.OPERATIONAL).length,
        deceased: agents.filter(a => a.lastKnownStatus === SecretAgentStatus.DECEASED).length,
        hostage: agents.filter(a => a.lastKnownStatus === SecretAgentStatus.HOSTAGE).length,
        contaminated: agents.filter(a => a.lastKnownStatus === SecretAgentStatus.CONTAMINATED).length,
        atRest: agents.filter(a => a.lastKnownStatus === SecretAgentStatus.REST).length,
        unknown: agents.filter(a => a.lastKnownStatus === SecretAgentStatus.UNKNOWN).length,
        requiresAttention: agents.filter(a => a.bananaBread && a.lastKnownStatus !== SecretAgentStatus.DECEASED).length,
      };
    }),
  })),
  // Async methods (rxMethod)
  withMethods((store) => {
    const agentService = inject(SecretAgentService);
    return {
      /**
       * Charge tous les agents
       */
      loadAgents: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            agentService.getSecretAgents().pipe(
              tap((agents) => patchState(store, { agents, isLoading: false })),
              catchError((error) => {
                console.error('Failed to load secret agents', error);
                patchState(store, {
                  isLoading: false,
                  error: 'Impossible de charger la liste des agents secrets',
                });
                return EMPTY;
              })
            )
          )
        )
      ),

      /**
       * Met à jour le statut d'un agent
       */
      updateAgentStatus: rxMethod<{ nickname: string; status: SecretAgentStatus }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ nickname, status }) =>
            agentService.updateAgentStatus(nickname, status).pipe(
              tap((updatedAgent) => {
                const agents = store.agents().map(a =>
                  a.nickname === updatedAgent.nickname ? updatedAgent : a
                );
                patchState(store, { agents, isLoading: false });
              }),
              catchError((error) => {
                console.error('Failed to update agent status', error);
                patchState(store, {
                  isLoading: false,
                  error: 'Impossible de mettre à jour le statut de l\'agent',
                });
                return EMPTY;
              })
            )
          )
        )
      ),

      /**
       * Met à jour la localisation d'un agent
       */
      updateAgentLocation: rxMethod<{ nickname: string; location: GeolocationCoordinates }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ nickname, location }) =>
            agentService.updateAgentLocation(nickname, location).pipe(
              tap((updatedAgent) => {
                const agents = store.agents().map(a =>
                  a.nickname === updatedAgent.nickname ? updatedAgent : a
                );
                patchState(store, { agents, isLoading: false });
              }),
              catchError((error) => {
                console.error('Failed to update agent location', error);
                patchState(store, {
                  isLoading: false,
                  error: 'Impossible de mettre à jour la localisation de l\'agent',
                });
                return EMPTY;
              })
            )
          )
        )
      ),

      /**
       * Réinitialise les agents depuis le mock
       */
      resetAgents: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            agentService.resetAgents().pipe(
              tap((agents) => patchState(store, { agents, isLoading: false })),
              catchError((error) => {
                console.error('Failed to reset agents', error);
                patchState(store, {
                  isLoading: false,
                  error: 'Impossible de réinitialiser les agents',
                });
                return EMPTY;
              })
            )
          )
        )
      ),
    };
  }),

  // Sync methods
  withMethods((store) => ({
    /**
     * Définit le filtre de statut
     */
    setStatusFilter(status: SecretAgentStatus | null): void {
      patchState(store, { filter: status });
    },

    /**
     * Définit la requête de recherche
     */
    setSearchQuery(query: string): void {
      patchState(store, { searchQuery: query });
    },

    /**
     * Sélectionne un agent par son nickname
     */
    selectAgent(nickname: string | null): void {
      patchState(store, { selectedAgentNickname: nickname });
    },

    /**
     * Récupère un agent par son nickname (computed)
     */
    getAgentByName(nickname: string) {
      return computed(() => store.agents().find((agent) => agent.nickname === nickname) || null);
    },

    /**
     * Efface l'erreur
     */
    clearError(): void {
      patchState(store, { error: null });
    },

    /**
     * Efface les filtres et la recherche
     */
    clearFilters(): void {
      patchState(store, { filter: null, searchQuery: '' });
    },
  }))
);
