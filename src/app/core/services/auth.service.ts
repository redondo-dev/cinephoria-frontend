// src/app/core/services/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface User {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  role: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  // ✅ Ajouter cette méthode
  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('🔑 [AUTH SERVICE] getToken appelé, token:', token ? '✅ Présent' : '❌ Absent');
    return token;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.currentUser();

    const isAuth = !!token && !!user;
    console.log('🔍 [AUTH SERVICE] isAuthenticated:', isAuth, '(token:', !!token, ', user:', !!user, ')');

    return isAuth;
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    console.log('📤 [AUTH SERVICE] Tentative de login:', credentials.email);

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: LoginResponse) => {
        console.log('✅ [AUTH SERVICE] Login réussi:', response);

        // Sauvegarder le token et l'utilisateur
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        this.currentUser.set(response.user);

        // Vérification immédiate
        console.log('💾 [AUTH SERVICE] Token sauvegardé:', localStorage.getItem('token'));
        console.log('👤 [AUTH SERVICE] User sauvegardé:', localStorage.getItem('user'));
      })
    );
  }

  logout(): void {
    console.log('🚪 [AUTH SERVICE] Logout...');

    this.currentUser.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    console.log('🗑️ [AUTH SERVICE] LocalStorage nettoyé');
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('user');

    console.log('🔄 [AUTH SERVICE] Chargement depuis localStorage - Token:', !!token, 'User:', !!userStr);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUser.set(user);
        console.log('✅ [AUTH SERVICE] User chargé:', user);
      } catch (error) {
        console.error('❌ [AUTH SERVICE] Erreur parsing user:', error);
        this.logout();
      }
    } else {
      console.log('⚠️ [AUTH SERVICE] Pas de données en localStorage');
    }
  }
}
