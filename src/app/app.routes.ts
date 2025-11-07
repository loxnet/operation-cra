import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './features/secret-agents/components/secret-agent-list/secret-agent-list.component'
      ).then((m) => m.SecretAgentListComponent),
  },
];
