import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Employe {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  username: string;
  password?: string;
}

export interface Film {
  id?: string;
  titre: string;
  description: string;
  duree: number;
  genre: string;
  datesSortie: string;
  affiche?: string;
  bandeAnnonce?: string;
}

export interface ReservationStats {
  film: string; // Correspond à "film"
  totalReservations: number;
  date:string;
}

export interface DashboardResponse {
  from: string;
  to: string;
  stats: ReservationStats[];
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);

  // URL de base de mon API REST
  private readonly apiUrl = 'http://localhost:3000/api/admin';

  createEmploye(employe: Employe): Observable<Employe> {
    return this.http
      .post<Employe>(`${this.apiUrl}/employes`, employe)
      .pipe(catchError(this.handleError));
  }


  resetPasswordEmploye(id: string, newPassword: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/employes/${id}/reset-password`,
      {
        newPassword,
      }
    );
  }

  getEmployes(): Observable<Employe[]> {
    return this.http
      .get<Employe[]>(`${this.apiUrl}/employes`)
      .pipe(catchError(this.handleError));
  }

  getEmployeById(id: number): Observable<Employe> {
    return this.http
      .get<Employe>(`${this.apiUrl}/employes/${id}`)
      .pipe(catchError(this.handleError));
  }

  updateEmploye(id: number, employe: Partial<Employe>): Observable<Employe> {
    return this.http
      .put<Employe>(`${this.apiUrl}/employes/${id}`, employe)
      .pipe(catchError(this.handleError));
  }

  deleteEmploye(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/employes/${id}`)
      .pipe(catchError(this.handleError));
  }

  // === DASHBOARD / STATISTIQUES (NoSQL) ===
  getReservationsStats(days: number = 7): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(
      `${this.apiUrl}/dashboard/reservations?days=${days}`
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erreur API AdminService :', error);
    let message = 'Une erreur est survenue.';

    if (error.error instanceof ErrorEvent) {
      message = `Erreur client : ${error.error.message}`;
    } else if (error.status === 0) {
      message = 'Impossible de contacter le serveur.';
    } else if (error.status === 409) {
      message = 'Le login existe déjà.';
    } else if (error.status >= 400) {
      message = error.error?.message || `Erreur serveur (${error.status})`;
    }

    return throwError(() => new Error(message));
  }

// === FILMS ===
  getFilms(): Observable<Film[]> {
    return this.http.get<Film[]>(`${this.apiUrl}/films`);
  }

  getFilm(id: string): Observable<Film> {
    return this.http.get<Film>(`${this.apiUrl}/films/${id}`);
  }

  createFilm(film: Film): Observable<Film> {
    return this.http.post<Film>(`${this.apiUrl}/films`, film);
  }

  updateFilm(id: string, film: Film): Observable<Film> {
    return this.http.put<Film>(`${this.apiUrl}/films/${id}`, film);
  }

  deleteFilm(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/films/${id}`);
  }
}
