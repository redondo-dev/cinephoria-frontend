// Guard générique qui accepte plusieurs rôles
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const RoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Récupérer les rôles autorisés depuis les données de la route
  const allowedRoles = route.data['roles'] as string[];

  return authService.currentUser$.pipe(
    map(user => {
       if (!user) {
        router.navigate(['/auth/login']);
        return false;
      }
    const userRole = user.role?.toUpperCase();
      const allowed = allowedRoles.map(r => r.toUpperCase());

      if (allowed.includes(userRole)) {
        return true;
      }

      router.navigate(['/home']); // ← redirige vers home si mauvais rôle
      return false;
    })

  );
};
