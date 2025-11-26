// src/app/core/guards/temp-password.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const tempPasswordGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();

  // Si l'utilisateur doit changer son mot de passe
  if (user && (user as any).mustChangePassword) {
    console.log('⚠️ [TEMP PASSWORD GUARD] Utilisateur doit changer son mot de passe');
    return true;
  }

  // Sinon rediriger vers l'accueil
  router.navigate(['/accueil']);
  return false;
};

