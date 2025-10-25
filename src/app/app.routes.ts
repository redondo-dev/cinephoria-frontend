import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

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
// Route reservations
{
      path: 'reservation',
    loadComponent: () => import('./components/reservation/reservation.component')
      .then(m => m.ReservationComponent),
    children: [
      {
        path: '',
        redirectTo: 'selection',
        pathMatch: 'full'
      },
      {
        path: 'selection',
        loadComponent: () => import('./components/reservation/cinema-film-selection/cinema-film-selection.component')
          .then(m => m.CinemaFilmSelectionComponent)
      },
      {
        path: 'seances',
        loadComponent: () => import('./components/reservation/seances-list/seances-list.component')
          .then(m => m.SeancesListComponent)
      },
      {
        path: 'sieges/:seanceId',
        loadComponent: () => import('./components/reservation/seat-selection/seat-selection.component')
          .then(m => m.SeatSelectionComponent)
      },
      {
        path: 'recapitulatif',
        loadComponent: () => import('./components/reservation/recapitulatif/recapitulatif.component')
          .then(m => m.RecapitulatifComponent)
      },
      {
        path: 'confirmation',
        loadComponent: () => import('./components/reservation/confirmation/confirmation.component')
          .then(m => m.ConfirmationComponent),
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: 'mes-commandes',
    loadComponent: () => import('./components/commandes/commandes.component')
      .then(m => m.CommandesComponent),
    canActivate: [AuthGuard]
  }
];
