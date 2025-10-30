import { Routes, CanActivate } from '@angular/router';
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

    children: [
      {
        path: '',
        redirectTo: 'selection',
        pathMatch: 'full',
      },

      {
        path: 'selection',
        loadComponent: () =>
          import('./components/reservation/reservation.component').then(
            (m) => m.ReservationComponent
          ),
      },

      {
        path: 'sieges/:seanceId',
        loadComponent: () =>
          import('./components/reservation/seat-selection/seat-selection.component').then(
            (m) => m.SeatSelectionComponent
          ),
      },

      {
        path: 'confirmation',
        loadComponent: () =>
          import(
            './components/reservation/reservation-confirmation/reservation-confirmation.component'
          ).then((m) => m.ReservationConfirmationComponent),
      },

   {
        path: 'payment',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import(
            './components/reservation/payment/payment.component'
          ).then((m) => m.PaymentComponent),
      },

      {
        path: 'payment/card',
        loadComponent: () =>
          import('./components/reservation/payment/payment-card/payment-card.component').then(
            (m) => m.PaymentCardComponent
          ),
      },
      {
        path: 'payment/paypal',
        loadComponent: () =>
          import('./components/reservation/payment/payment-paypal/payment-paypal.component').then(
            (m) => m.PaymentPaypalComponent
          ),
      },

   {
        path: 'success/:id',
        loadComponent: () =>
          import(
            './components/reservation/success/success.component'
          ).then((m) => m.ReservationSuccessComponent),
      },

    ],
  },
];
