// src/app/admin/admin.routes.ts
import { Routes } from '@angular/router';
import { AdminGuard } from '../../../core/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    // canActivate: [AdminGuard],
    loadComponent: () =>
      import('../admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        title: 'Dashboard - Administration',
      },

      //routes pour films
      {
        path: 'films',
        loadComponent: () =>
          import('../pages/films/film-list/film-list.component').then(
            (m) => m.FilmListComponent
          ),
        title: 'Gestion des Films',
      },
      {
        path: 'films/create',
        loadComponent: () =>
          import('../pages/films/film-form/film-form.component').then(
            (m) => m.FilmFormComponent
          ),
        title: 'Créer un Film',
      },
      {
        path: 'films/edit/:id',
        loadComponent: () =>
          import('../pages/films/film-form/film-form.component').then(
            (m) => m.FilmFormComponent
          ),
        title: 'Modifier un Film',
      },

      //routes pour employe
      {
        path: 'employes',
        loadComponent: () =>
          import(
            '../pages/employes/employes-list/employes-list.component'
          ).then((m) => m.EmployesListComponent),
        title: 'Gestion des Employés',
      },
      {
        path: 'employes/create',
        loadComponent: () =>
          import('../pages/employes/employe-form/employe-form.component').then(
            (m) => m.EmployeFormComponent
          ),
        title: 'Créer un Employé',
      },
      {
        path: 'employes/edit/:id',
        loadComponent: () =>
          import('../pages/employes/employe-form/employe-form.component').then(
            (m) => m.EmployeFormComponent
          ),
        title: 'Modifier un Employé',
      },
      //routes pour seances
      {
        path: 'seances',
        loadComponent: () =>
          import('../pages/seances/seance-list/seance-list.component').then(
            (m) => m.SeanceListComponent
          ),
        title: 'Gestion des Séances',
      },
      {
        path: 'seances/create',
        loadComponent: () =>
          import('../pages/seances/seance-form/seance-form.component').then(
            (m) => m.SeanceFormComponent
          ),
        title: 'Créer une Séance',
      },
      {
        path: 'seances/edit/:id',
        loadComponent: () =>
          import('../pages/seances/seance-form/seance-form.component').then(
            (m) => m.SeanceFormComponent
          ),
        title: 'Modifier une Séance',
      },
      //routes pour salles
      {
        path: 'salles',
        loadComponent: () =>
          import('../pages/salles/salle-list/salle-list.component').then(
            (m) => m.SalleListComponent
          ),
        title: 'Gestion des Salles',
      },
      {
        path: 'salles/create',
        loadComponent: () =>
          import('../pages/salles/salle-form/salle-form.component').then(
            (m) => m.SalleFormComponent
          ),
        title: 'Créer une Salle',
      },
      {
        path: 'salles/edit/:id',
        loadComponent: () =>
          import('../pages/salles/salle-form/salle-form.component').then(
            (m) => m.SalleFormComponent
          ),
        title: 'Modifier une Salle',
      },
    ],
  },
];
