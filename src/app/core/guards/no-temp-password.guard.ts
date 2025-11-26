import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const noTempPasswordGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();

  // Si l'utilisateur doit changer son mot de passe, bloquer l'accès
  if (user && (user as any).mustChangePassword) {
    console.log('🚫 [NO TEMP PASSWORD GUARD] Changement de MDP requis');
    router.navigate(['/change-password']);
    return false;
  }

  return true;
};
