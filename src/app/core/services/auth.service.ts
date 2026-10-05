// src/app/core/services/auth.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  name?: string;
  role: string;
  username?: string;
  mustChangePassword?: boolean;
}

export interface LoginResponse {
  user: User;
  message: string;
}

export interface RegisterData {
  email: string;
  password: string;
  prenom: string;
  nom: string;
  username?: string;
  captchaToken?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private apiUrl = `${environment.apiUrl}/api/auth`;

  //  Observable pour les guards et components qui utilisent currentUser$
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  //  Observable pour isAuthenticated$
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private redirectUrl: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    console.log('🌐 API URL:', this.apiUrl);
    this.loadUserFromStorage();
  }

  // ========================================
  // AUTHENTICATION STATUS
  // ========================================

  isAuthenticated(): boolean {
    const user = localStorage.getItem('user');
    return !!user && this.isAuthenticatedSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  // ========================================
  // REDIRECT URL MANAGEMENT
  // ========================================

  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
    console.log('🔗 [AUTH SERVICE] Redirect URL définie:', url);
  }

  getRedirectUrl(): string | null {
    return this.redirectUrl;
  }

  clearRedirectUrl(): void {
    this.redirectUrl = null;
  }

  // ========================================
  // LOGIN
  // ========================================

  login(
    email: string,
    password: string,
    captchaToken: string,
  ): Observable<LoginResponse> {
    console.log(' [AUTH SERVICE] Tentative de login:', email);
    console.log('[AUTH SERVICE] Password length:', password?.length);
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, {
        email,
        password,
        captchaToken,
      })
      .pipe(
        tap((response: LoginResponse) => {
          console.log(' [AUTH SERVICE] Login réussi:', response);

          // Ajouter l'alias 'name' pour compatibilité
          const userWithName = {
            ...response.user,
            name: `${response.user.prenom} ${response.user.nom}`,
          };

          localStorage.setItem('user', JSON.stringify(userWithName));

          // Mettre à jour les signals et subjects
          this.currentUser.set(userWithName);
          this.currentUserSubject.next(userWithName);
          this.isAuthenticatedSubject.next(true);

          // Vérification immédiate
          console.log(
            ' [AUTH SERVICE] Token sauvegardé:',
            localStorage.getItem('token'),
          );
          console.log(
            ' [AUTH SERVICE] User sauvegardé:',
            localStorage.getItem('user'),
          );
        }),
      );
  }

  // ========================================
  // REGISTER
  // ========================================

  register(data: RegisterData): Observable<any> {
    console.log("[AUTH SERVICE] Tentative d'inscription:", data.email);

    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((response: any) => {
        console.log('[AUTH SERVICE] Inscription réussie:', response);
      }),
    );
  }

  // // ========================================
  // PASSWORD RESET (US 11)
  // ========================================

  resetPassword(email: string): Observable<{ message: string }> {
    console.log(
      ' [AUTH SERVICE] Demande de réinitialisation mot de passe:',
      email,
    );

    return this.http
      .post<{ message: string }>(`${this.apiUrl}/forgot-password-visiteur`, {
        email,
      })
      .pipe(
        tap((response) => {
          console.log(
            '[AUTH SERVICE] Email de réinitialisation envoyé:',
            response,
          );
        }),
      );
  }

  // =============================
  // CHANGE TEMPORARY PASSWORD
  //==============================
  changeTemporaryPassword(
    email: string,
    tempPassword: string,
    newPassword: string,
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/reset-password`,
      {
        email,
        tempPassword,
        newPassword,
      },
    );
  }
  // ========================================
  // LOGOUT
  // ========================================

logout(): void {
  // Appeler le backend pour effacer le cookie HttpOnly
  this.http.post(`${this.apiUrl}/logout`, {},
    { withCredentials: true }
  ).subscribe({
    complete: () => {
      this.currentUser.set(null);
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      localStorage.removeItem('user');
      this.clearRedirectUrl();
      this.router.navigate(['/login']);
    }
  });
}
  // ========================================
  // LOAD USER FROM STORAGE
  // ========================================

  private loadUserFromStorage(): void {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (!user.name && user.prenom && user.nom) {
        user.name = `${user.prenom} ${user.nom}`;
      }
      this.currentUser.set(user);
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } catch {
      this.logout();
    }
  } else {
    this.isAuthenticatedSubject.next(false);
  }
}
}
