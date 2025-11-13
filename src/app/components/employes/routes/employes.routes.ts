import { Routes } from '@angular/router';
// import { authGuard } from '../guards/auth.guard';

export const EMPLOYE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'films',
    pathMatch: 'full',
  },

  // Routes pour films
  {
    path: 'films',
    loadComponent: () =>
      import('../pages/films/films.component').then((m) => m.FilmsComponent),
    title: 'Gestion des Films',
  },
  // Routes pour séances
  {
    path: 'seances',
    loadComponent: () =>
      import('../pages/seances/seances.component').then(
        (m) => m.SeancesComponent
      ),
    title: 'Gestion des Séances',
  },
  // Routes pour salles
  {
    path: 'salles',
    loadComponent: () =>
      import('../pages/salles/salles.component').then((m) => m.SallesComponent),
    title: 'Gestion des Salles',
  },
  // Routes pour avis
  {
    path: 'avis',
    loadComponent: () =>
      import('../pages/avis/avis.component').then((m) => m.AvisComponent),
    title: 'Modération des Avis',
  },
];
