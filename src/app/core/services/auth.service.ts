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
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  prenom: string;
  nom: string;
  username?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private apiUrl = `${environment.apiUrl}/api/auth`;

  // ✅ Observable pour les guards et components qui utilisent currentUser$
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // ✅ Observable pour isAuthenticated$
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private redirectUrl: string | null = null;

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  // ========================================
  // TOKEN MANAGEMENT
  // ========================================

  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log(
      '🔑 [AUTH SERVICE] getToken appelé, token:',
      token ? '✅ Présent' : '❌ Absent'
    );
    return token;
  }

  // ========================================
  // AUTHENTICATION STATUS
  // ========================================

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.currentUser();
    const isAuth = !!token && !!user;

    console.log(
      '🔍 [AUTH SERVICE] isAuthenticated:',
      isAuth,
      '(token:',
      !!token,
      ', user:',
      !!user,
      ')'
    );

    return isAuth;
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

  login(email: string, password: string): Observable<LoginResponse> {
    console.log('📤 [AUTH SERVICE] Tentative de login:', email);
  console.log('🔑 [AUTH SERVICE] Password length:', password?.length);
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response: LoginResponse) => {
          console.log('✅ [AUTH SERVICE] Login réussi:', response);

          // Ajouter l'alias 'name' pour compatibilité
          const userWithName = {
            ...response.user,
            name: `${response.user.prenom} ${response.user.nom}`,
          };

          // Sauvegarder le token et l'utilisateur
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(userWithName));

          // Mettre à jour les signals et subjects
          this.currentUser.set(userWithName);
          this.currentUserSubject.next(userWithName);
          this.isAuthenticatedSubject.next(true);

          // Vérification immédiate
          console.log(
            '💾 [AUTH SERVICE] Token sauvegardé:',
            localStorage.getItem('token')
          );
          console.log(
            '👤 [AUTH SERVICE] User sauvegardé:',
            localStorage.getItem('user')
          );
        })
      );
  }

  // ========================================
  // REGISTER
  // ========================================

  register(data: RegisterData): Observable<any> {
    console.log("📝 [AUTH SERVICE] Tentative d'inscription:", data.email);

    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((response: any) => {
        console.log('✅ [AUTH SERVICE] Inscription réussie:', response);
      })
    );
  }

  // ========================================
  // LOGOUT
  // ========================================

  logout(): void {
    console.log('🚪 [AUTH SERVICE] Logout...');

    // Réinitialiser tout
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.clearRedirectUrl();

    console.log('🗑️ [AUTH SERVICE] LocalStorage nettoyé');
  }

  // ========================================
  // LOAD USER FROM STORAGE
  // ========================================

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('user');

    console.log(
      '🔄 [AUTH SERVICE] Chargement depuis localStorage - Token:',
      !!token,
      'User:',
      !!userStr
    );

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);

        // Ajouter 'name' si manquant
        if (!user.name && user.prenom && user.nom) {
          user.name = `${user.prenom} ${user.nom}`;
        }

        this.currentUser.set(user);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);

        console.log('✅ [AUTH SERVICE] User chargé:', user);
      } catch (error) {
        console.error('❌ [AUTH SERVICE] Erreur parsing user:', error);
        this.logout();
      }
    } else {
      console.log('⚠️ [AUTH SERVICE] Pas de données en localStorage');
      this.isAuthenticatedSubject.next(false);
    }
  }
}
