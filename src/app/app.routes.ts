import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  // Route publique - Liste des films
  {
    path: 'films',
    data: { title: 'Cinephoria - Tous les films' },
    loadComponent: () =>
      import('./components/films-list-component/films-list-component').then(
        (m) => m.FilmsListComponent
      ),
  },

  // Route publique - Détail d'un film
  {
    path: 'films/:id',
    data: { title: 'Cinephoria - Détail du film' },
    loadComponent: () =>
      import('./components/film-detail-component/film-detail-component').then(
        (m) => m.FilmDetailComponentComponent
      ),
  },
  // Routes d'authentification

  {
    path: 'auth/register',
    loadComponent: () =>
      import('./components/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    title: 'Créer un compte - Cinephoria',
  },

  {
    path: 'auth/login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
];
