import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';



export interface User {
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: { id: string; email: string; name: string };
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://cinephoria-9y7y.onrender.com/api';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasToken()
  );
  private currentUserSubject = new BehaviorSubject<any>(this.getStoredUser());

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('jwt_token');
  }

  private getStoredUser(): any {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  }
  // Nouvelle méthode pour l'inscription
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/auth/register`,
      data
    );
  }
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          localStorage.setItem('jwt_token', response.token);
          localStorage.setItem('current_user', JSON.stringify(response.user));
          this.isAuthenticatedSubject.next(true);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('redirect_url');
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  setRedirectUrl(url: string): void {
    localStorage.setItem('redirect_url', url);
  }

  getRedirectUrl(): string | null {
    return localStorage.getItem('redirect_url');
  }

  clearRedirectUrl(): void {
    localStorage.removeItem('redirect_url');
  }
}
