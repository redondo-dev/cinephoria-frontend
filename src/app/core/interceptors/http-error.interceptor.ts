// src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('❌ [ERROR INTERCEPTOR] Erreur HTTP:', {
        status: error.status,
        url: error.url,
        message: error.message
      });

      // Erreur de connexion (CORS, serveur down)
      if (error.status === 0) {
        console.error('🔌 Serveur indisponible ou erreur CORS');
        return throwError(() => ({
          message: 'Impossible de se connecter au serveur. Vérifiez votre connexion.',
          status: 0,
          url: error.url
        }));
      }

      // Erreur 401 : Non autorisé
      if (error.status === 401) {
        console.warn('🔒 Erreur 401 - Non autorisé');

        // Ne déconnecter QUE si ce n'est pas une route d'authentification
        if (!req.url.includes('/auth/login') &&
            !req.url.includes('/auth/register')) {
          console.log('🚪 Déconnexion et redirection vers login');
          authService.logout();
          router.navigate(['/auth/login']);
        }
      }

      // Erreur 403 : Accès interdit
      if (error.status === 403) {
        console.warn('🚫 Erreur 403 - Accès interdit');
        // Optionnel : rediriger vers une page "accès refusé"
        // router.navigate(['/forbidden']);
      }

      // Erreur 404 : Ressource non trouvée
      if (error.status === 404) {
        console.warn('🔍 Erreur 404 - Ressource non trouvée');
      }

      // Erreur 500 : Erreur serveur
      if (error.status === 500) {
        console.error('💥 Erreur 500 - Erreur serveur');
      }

      const errorMessage = getErrorMessage(error);

      return throwError(() => ({
        message: errorMessage,
        status: error.status,
        url: error.url
      }));
    })
  );
};

function getErrorMessage(error: HttpErrorResponse): string {
  // Erreur CORS
  if (error.status === 0) {
    return 'Erreur de connexion au serveur. Vérifiez que le backend est démarré.';
  }

  // Erreur client
  if (error.error instanceof ErrorEvent) {
    return `Erreur: ${error.error.message}`;
  }

  // Messages d'erreur du backend
  if (error.error?.message) {
    return error.error.message;
  }

  // Messages par défaut selon le code HTTP
  switch (error.status) {
    case 400:
      return 'Mauvaise requête. Vérifiez les données envoyées.';
    case 401:
      return 'Non autorisé. Veuillez vous connecter.';
    case 403:
      return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
    case 404:
      return 'Ressource non trouvée.';
    case 409:
      return 'Conflit. Cette ressource existe déjà.';
    case 500:
      return 'Erreur serveur. Veuillez réessayer plus tard.';
    case 503:
      return 'Service indisponible. Maintenance en cours.';
    default:
      return `Erreur HTTP ${error.status}: ${error.statusText}`;
  }
}
