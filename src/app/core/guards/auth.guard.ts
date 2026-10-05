// // 3. auth.guard.ts
// import { Injectable } from '@angular/core';
// import {
//   CanActivate,
//   ActivatedRouteSnapshot,
//   RouterStateSnapshot,
//   Router,
// } from '@angular/router';
// import { AuthService } from '../services/auth.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthGuard implements CanActivate {
//   constructor(
//     private authService: AuthService,
//     private router: Router,
//   ) {}

//   canActivate(
//     route: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot,
//   ): boolean {
//     if (this.authService.isAuthenticated()) {
//       return true;
//     }

//     this.authService.setRedirectUrl(state.url);
//     this.router.navigate(['/auth/login']);
//     return false;
//   }
// }
// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router     = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  authService.setRedirectUrl(state.url);
  return router.createUrlTree(['/auth/login']);
  // createUrlTree au lieu de navigate + return false
  // → meilleure intégration avec le router Angular moderne
};
