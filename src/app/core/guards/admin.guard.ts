// src/app/core/guards/admin.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    map(user => {
      if (user && user.role === 'ADMIN') {
        return true;
      }

      // Rediriger vers la page de connexion si non autorisé
      router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    })
  );
};
