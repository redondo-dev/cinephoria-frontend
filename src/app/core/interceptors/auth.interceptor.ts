// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Récupérer le token depuis localStorage
  const token = localStorage.getItem('token');

  // Debug
  console.log('[AUTH INTERCEPTOR] Token:', token ? 'Présent' : ' Absent');
  console.log('📦 [AUTH INTERCEPTOR] Params:', req.params.toString());
  console.log(' [AUTH INTERCEPTOR] URL:', req.url);

  // Ne pas ajouter le token pour les routes d'authentification
  if (
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/forgot-password')
  ) {
    console.log('[AUTH INTERCEPTOR] Route auth, pas de token ajouté');
    return next(req);
  }

  // Si un token existe, l'ajouter au header
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
      params: req.params,
    });

    console.log(' [AUTH INTERCEPTOR] Token ajouté au header');
    return next(clonedRequest);
  }

  console.log('[AUTH INTERCEPTOR] Requête sans token');
  return next(req);
};
