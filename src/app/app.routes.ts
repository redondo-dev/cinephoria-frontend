import { EmployesDashboardComponent } from './components/employes/pages/employes-dashboard/employes-dashboard.component';
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { ADMIN_ROUTES } from './components/admin/routes/admin.routes';
import { EMPLOYE_ROUTES } from './components/employes/routes/employes.routes';
import { AdminGuard } from './core/guards/admin.guard';
// import { EmployeeGuard } from './core/guards/employee.guard';
import { ClientGuard } from './core/guards/client.guard';
import { RoleGuard } from './core/guards/role.guard';
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },

  // Routes d'administration
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    children: ADMIN_ROUTES,
  },

  // Route publique - Liste des films
  {
    path: 'films',
    data: { title: 'Cinephoria - Tous les films' },
    loadComponent: () =>
      import(
        './components/films/films-list-component/films-list-component'
      ).then((m) => m.FilmsListComponent),
  },

  // Route publique - Détail d'un film
  {
    path: 'films/:id',
    data: { title: 'Cinephoria - Détail du film' },
    loadComponent: () =>
      import(
        './components/films/film-detail-component/film-detail-component'
      ).then((m) => m.FilmDetailComponent),
  },
  // Routes d'authentification

  {
    path: 'auth/register',
    canActivate: [AuthGuard],
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
          import(
            './components/reservation/seat-selection/seat-selection.component'
          ).then((m) => m.SeatSelectionComponent),
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
          import('./components/reservation/payment/payment.component').then(
            (m) => m.PaymentComponent
          ),
      },

      {
        path: 'payment/card',
        loadComponent: () =>
          import(
            './components/reservation/payment/payment-card/payment-card.component'
          ).then((m) => m.PaymentCardComponent),
      },
      {
        path: 'payment/paypal',
        loadComponent: () =>
          import(
            './components/reservation/payment/payment-paypal/payment-paypal.component'
          ).then((m) => m.PaymentPaypalComponent),
      },

      {
        path: 'success/:id',
        loadComponent: () =>
          import('./components/reservation/success/success.component').then(
            (m) => m.ReservationSuccessComponent
          ),
      },
    ],
  },
  // routes contact
  {
    path: 'contact',
    loadComponent: () =>
      import('./components/contact/contact.component').then(
        (m) => m.ContactComponent
      ),
    title: 'Contact - Cinéphoria',
  },
  //routes employes

  {
    path: 'intranet',
    canActivate: [AuthGuard, RoleGuard],
     data: { roles: ['EMPLOYE'] },
    loadComponent: () =>
      import(
        './components/employes/pages/employes-dashboard/employes-dashboard.component'
      ).then((m) => m.EmployesDashboardComponent),
    title: 'Intranet employé - Cinéphoria',
  },

  // routes pour users
  {
    path: 'mon-espace',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CLIENT'] },
    loadComponent: () =>
      import('./components/users/pages/mon-espace/mon-espace.component').then(
        (m) => m.MonEspaceComponent
      ),
  },
];
