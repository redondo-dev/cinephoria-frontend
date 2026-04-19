import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Data } from '@angular/router';

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
  genre_id: string;
  genre: string;
  affiche?: string;
}

export interface ReservationStats {
  film: string; // Correspond à "film"
  totalReservations: number;
  date: string;
}

export interface DashboardResponse {
  from: string;
  to: string;
  stats: ReservationStats[];
}

export interface Seance {
  id: number;
  filmId: number;
  salleId: number;
  date_seance: string;
  dateHeureFin: string;
  prix: number;
  placesDisponibles?: number;
  // Champs enrichis par l'API
  film?: string;
  salle?: string;
  prixMoyen?: number;
}
export interface Salle {
  id?: string;
  nom: string;
  nombrePlaces: number;
  qualiteProjection?: 'Standard' | '4K' | 'IMAX' | 'Dolby Atmos';
}
@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);

  // URL de base de mon API REST
  private readonly apiUrl = `${environment.apiUrl}/api/admin`;

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
      },
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
      `${this.apiUrl}/dashboard/reservations?days=${days}`,
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

  //CRUD Seances

  getSeances(): Observable<Seance[]> {
    return this.http
      .get<{ data: Seance[] }>(`${this.apiUrl}/seances`)
      .pipe(map((res: { data: Seance[] }) => res.data || []));
  }

  getSeance(id: string): Observable<Seance> {
    return this.http.get<Seance>(`${this.apiUrl}/seances/${id}`);
  }

  createSeance(seance: Seance): Observable<Seance> {
    return this.http.post<Seance>(`${this.apiUrl}/seances`, seance);
  }

  updateSeance(id: string, seance: Seance): Observable<Seance> {
    return this.http.put<Seance>(`${this.apiUrl}/seances/${id}`, seance);
  }

  deleteSeance(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/seances/${id}`);
  }

  //Crud salles

  getSalles(): Observable<Salle[]> {
    return this.http
      .get<{ data: Salle[] }>(`${this.apiUrl}/salles`)
      .pipe(map((res: { data: Salle[] }) => res.data || []));
  }

  getSalle(id: string): Observable<Salle> {
    return this.http.get<Salle>(`${this.apiUrl}/salles/${id}`);
  }

  createSalle(salle: Salle): Observable<Salle> {
    return this.http.post<Salle>(`${this.apiUrl}/salles`, salle);
  }

  updateSalle(id: string, salle: Salle): Observable<Salle> {
    return this.http
      .patch<Salle>(`${this.apiUrl}/salles/${id}`, salle)
      .pipe(catchError(this.handleError));
  }

  deleteSalle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/salles/${id}`);
  }
}
