import { signalStore, withMethods, withState, withComputed, patchState } from '@ngrx/signals';
import { SecretAgent, SecretAgentState, SecretAgentStatus } from './secret-agent.interface';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { SecretAgentService } from '../secret-agent.service';

const initialState: SecretAgentState = {
  agents: [],
  isLoading: false,
  error: null,
  filter: SecretAgentStatus.OPERATIONAL,
};

export const SecretAgentStore = signalStore(

  withState<SecretAgentState>(initialState),
  withComputed((store) => ({
    filteredAgents: computed(() => {
      const agents = store.agents();
      const filter = store.filter();

      let result = filter ? agents.filter((a) => a.lastKnownStatus === filter) : agents;
      result.sort((a, b) => {
        if(a.lastKnownStatus < b.lastKnownStatus) {
          return 0
        } else {
          return 1
        }
      });
      return result;
    }),
  })),
  withMethods((store) => {
    const agentService = inject(SecretAgentService);
    return {
      loadAgents: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            agentService.getSecretAgents().pipe(
              tap((agents) => patchState(store, { agents, isLoading: false })),
              catchError((error) => {
                console.log('Failed to load secret agents', error);
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
    };
  }),
  withMethods((store) => ({
    getAgentByName(nickname: string) {
      return computed(() => store.agents().find((agent) => agent.nickname === nickname) || null);
    },
  }))
);
