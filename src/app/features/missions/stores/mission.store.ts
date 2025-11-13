import { signalStore, withMethods, withState, withComputed, patchState } from '@ngrx/signals';
import { MissionState, SecretMission, MissionStatus } from './mission.interface';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { MissionService } from '../mission.service';
import { SecretAgentStatus } from '../../secret-agents/stores/secret-agent.interface';

const initialState: MissionState = {
  missions: [],
  isLoading: false,
  error: null,
  selectedMissionId: null,
};

export const MissionStore = signalStore(
  withState<MissionState>(initialState),

  // Computed selectors
  withComputed((store) => ({
    /**
     * Missions triées par statut (IN_PROGRESS en premier)
     */
    sortedMissions: computed(() => {
      const missions = [...store.missions()];
      return missions.sort((a, b) => {
        const statusOrder = { 'IN_PROGRESS': 0, 'PLANNED': 1, 'ABORTED': 2, 'OVER': 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
    }),

    /**
     * Missions avec agent assigné
     */
    assignedMissions: computed(() => {
      return store.missions().filter(m => m.assignedAgentNickname !== null);
    }),

    /**
     * Missions disponibles (sans agent)
     */
    availableMissions: computed(() => {
      return store.missions().filter(m => m.assignedAgentNickname === null);
    }),

    /**
     * Missions en cours
     */
    activeMissions: computed(() => {
      return store.missions().filter(m => m.status === MissionStatus.IN_PROGRESS);
    }),

    /**
     * Missions planifiées
     */
    plannedMissions: computed(() => {
      return store.missions().filter(m => m.status === MissionStatus.PLANNED);
    }),

    /**
     * Mission sélectionnée
     */
    selectedMission: computed(() => {
      const id = store.selectedMissionId();
      if (!id) return null;
      return store.missions().find(m => m.id === id) || null;
    }),

    /**
     * Statistiques des missions
     */
    statistics: computed(() => {
      const missions = store.missions();
      return {
        total: missions.length,
        inProgress: missions.filter(m => m.status === MissionStatus.IN_PROGRESS).length,
        planned: missions.filter(m => m.status === MissionStatus.PLANNED).length,
        aborted: missions.filter(m => m.status === MissionStatus.ABORTED).length,
        over: missions.filter(m => m.status === MissionStatus.OVER).length,
        withAgent: missions.filter(m => m.assignedAgentNickname !== null).length,
        withoutAgent: missions.filter(m => m.assignedAgentNickname === null).length,
      };
    }),
  })),

  // Async methods (rxMethod)
  withMethods((store) => {
    const missionService = inject(MissionService);

    return {
      /**
       * Charge toutes les missions
       */
      loadMissions: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            missionService.getMissions().pipe(
              tap((missions) => patchState(store, { missions, isLoading: false })),
              catchError((error) => {
                console.error('Failed to load missions', error);
                patchState(store, {
                  isLoading: false,
                  error: 'Impossible de charger la liste des missions',
                });
                return EMPTY;
              })
            )
          )
        )
      ),

      /**
       * Assigne un agent à une mission
       * Règles métier :
       * - L'agent doit être OPERATIONAL
       * - La mission ne doit pas avoir d'agent assigné
       * - Un agent ne peut être sur qu'une seule mission à la fois
       */
      assignAgent: rxMethod<{ missionId: string; agentNickname: string; agentStatus: SecretAgentStatus }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ missionId, agentNickname, agentStatus }) => {
            // Vérifier que l'agent est opérationnel
            if (agentStatus !== SecretAgentStatus.OPERATIONAL) {
              patchState(store, {
                isLoading: false,
                error: 'Seuls les agents opérationnels peuvent être assignés à une mission',
              });
              return EMPTY;
            }

            // Vérifier que l'agent n'est pas déjà sur une autre mission
            const agentAlreadyAssigned = store.missions().some(
              m => m.assignedAgentNickname === agentNickname && m.status === MissionStatus.IN_PROGRESS
            );

            if (agentAlreadyAssigned) {
              patchState(store, {
                isLoading: false,
                error: `L'agent ${agentNickname} est déjà assigné à une autre mission`,
              });
              return EMPTY;
            }

            return missionService.assignAgentToMission(missionId, agentNickname).pipe(
              tap((updatedMission) => {
                const missions = store.missions().map(m =>
                  m.id === updatedMission.id ? updatedMission : m
                );
                patchState(store, { missions, isLoading: false });
              }),
              catchError((error) => {
                console.error('Failed to assign agent to mission', error);
                patchState(store, {
                  isLoading: false,
                  error: error.message || 'Impossible d\'assigner l\'agent à la mission',
                });
                return EMPTY;
              })
            );
          })
        )
      ),

      /**
       * Désassigne un agent d'une mission
       */
      unassignAgent: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((missionId) =>
            missionService.unassignAgentFromMission(missionId).pipe(
              tap((updatedMission) => {
                const missions = store.missions().map(m =>
                  m.id === updatedMission.id ? updatedMission : m
                );
                patchState(store, { missions, isLoading: false });
              }),
              catchError((error) => {
                console.error('Failed to unassign agent from mission', error);
                patchState(store, {
                  isLoading: false,
                  error: 'Impossible de désassigner l\'agent de la mission',
                });
                return EMPTY;
              })
            )
          )
        )
      ),

      /**
       * Met à jour le statut d'une mission
       */
      updateStatus: rxMethod<{ missionId: string; status: MissionStatus }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ missionId, status }) =>
            missionService.updateMissionStatus(missionId, status).pipe(
              tap((updatedMission) => {
                const missions = store.missions().map(m =>
                  m.id === updatedMission.id ? updatedMission : m
                );
                patchState(store, { missions, isLoading: false });
              }),
              catchError((error) => {
                console.error('Failed to update mission status', error);
                patchState(store, {
                  isLoading: false,
                  error: 'Impossible de mettre à jour le statut de la mission',
                });
                return EMPTY;
              })
            )
          )
        )
      ),

      /**
       * Réinitialise les missions depuis le mock
       */
      resetMissions: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            missionService.resetMissions().pipe(
              tap((missions) => patchState(store, { missions, isLoading: false })),
              catchError((error) => {
                console.error('Failed to reset missions', error);
                patchState(store, {
                  isLoading: false,
                  error: 'Impossible de réinitialiser les missions',
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
     * Sélectionne une mission par son ID
     */
    selectMission(missionId: string | null): void {
      patchState(store, { selectedMissionId: missionId });
    },

    /**
     * Récupère une mission par son ID (computed)
     */
    getMissionById(missionId: string) {
      return computed(() => store.missions().find(m => m.id === missionId) || null);
    },

    /**
     * Récupère la mission assignée à un agent
     */
    getMissionByAgent(agentNickname: string) {
      return computed(() =>
        store.missions().find(
          m => m.assignedAgentNickname === agentNickname && m.status === MissionStatus.IN_PROGRESS
        ) || null
      );
    },

    /**
     * Efface l'erreur
     */
    clearError(): void {
      patchState(store, { error: null });
    },
  }))
);
