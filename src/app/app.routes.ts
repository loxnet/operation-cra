import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/missions',
    pathMatch: 'full'
  },
  {
    path: 'missions',
    loadComponent: () =>
      import(
        './views/mission-dashboard/mission-dashboard'
      ).then((m) => m.MissionDashboard),
  },
  {
    path: 'agents',
    loadComponent: () =>
      import(
        './views/home/home.component'
      ).then((m) => m.HomeComponent),
  },
];
