import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      retry(1),
      catchError((error: HttpErrorResponse) => {
        const errorMessage = this.getErrorMessage(error);

        // Gérer les erreurs spécifiques
        if (error.status === 0) {
          // Erreur de connexion au serveur
          console.error('Erreur de connexion. Serveur indisponible.', error);
        }
        
     if (error.status === 401) {
          // Ne déconnecter QUE si on n'est PAS sur la page de login
          if (!request.url.includes('/auth/login') &&
              !request.url.includes('/auth/register')) {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }

        if (error.status === 403) {
          // Accès interdit
          this.router.navigate(['/forbidden']);
        }

        if (error.status === 404) {
          // Ressource non trouvée
          console.warn('Ressource non trouvée:', error.url);
        }

        console.error('Erreur HTTP:', {
          status: error.status,
          message: errorMessage,
          url: error.url,
        });

        return throwError(() => ({
          message: errorMessage,
          status: error.status,
          originalError: error,
        }));
      })
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    // CORS Error
    if (error.status === 0) {
      return 'Erreur CORS: Impossible de se connecter au serveur. Vérifiez la configuration CORS du backend.';
    }

    // Erreur client
    if (error.error instanceof ErrorEvent) {
      return `Erreur: ${error.error.message}`;
    }

    // Erreur serveur
    switch (error.status) {
      case 400:
        return error.error?.message || 'Mauvaise requête';
      case 401:
        return 'Non autorisé. Veuillez vous connecter.';
      case 403:
        return 'Accès refusé.';
      case 404:
        return 'Ressource non trouvée.';
      case 500:
        return 'Erreur serveur. Veuillez réessayer.';
      case 503:
        return 'Service indisponible. Maintenance en cours.';
      default:
        return `Erreur HTTP ${error.status}: ${error.statusText}`;
    }
  }
}
