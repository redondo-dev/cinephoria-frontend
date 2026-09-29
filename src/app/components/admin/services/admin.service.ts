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
  genres?: { id: number; nom: string }[];
  genre_id: string;

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
  dateHeureDebut: string;
  dateHeureFin: string;
  // Champs enrichis par l'API
  film?: string;
  salle?: string;
}
export interface Salle {
  id: number;
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

  resetPasswordEmploye(id: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.apiUrl}/employes/${id}/reset-password`,
      {},
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
    return this.http
      .get<{ data: Film[] }>(`${this.apiUrl}/films`)
      .pipe(map((res) => res.data || []));
  }

  getFilm(id: string): Observable<Film> {
    return this.http
      .get<{ data: Film }>(`${this.apiUrl}/films/${id}`)
      .pipe(map((res) => res.data));
  }

  createFilm(film: Film): Observable<Film> {
    return this.http
      .post<{ data: Film }>(`${this.apiUrl}/films`, film)
      .pipe(map((res) => res.data));
  }

  updateFilm(id: string, film: Film): Observable<Film> {
    return this.http
      .put<{ data: Film }>(`${this.apiUrl}/films/${id}`, film)
      .pipe(map((res) => res.data));
  }

  deleteFilm(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/films/${id}`);
  }
  //CRUD Seances
  getSeances(
    page = 1,
    limit = 20,
    filmId?: number,
    salleId?: number,
  ): Observable<any> {
    const params: any = {
      page: page.toString(),
      limit: limit.toString(),
    };
    if (filmId) params.filmId = filmId.toString();
    if (salleId) params.salleId = salleId.toString();
    return this.http.get(`${this.apiUrl}/seances`, { params });
  }
  getSeance(id: string): Observable<Seance> {
    return this.http.get<Seance>(`${this.apiUrl}/seances/${id}`);
  }

  createSeance(seance: Seance): Observable<Seance> {
    return this.http.post<Seance>(`${this.apiUrl}/seances`, seance);
  }

  updateSeance(id: string, seance: Seance): Observable<Seance> {
    return this.http.patch<Seance>(`${this.apiUrl}/seances/${id}`, seance);
  }

  deleteSeance(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/seances/${id}`);
  }

  bulkDeleteSeances(ids: number[]): Observable<any> {
    return this.http.request('delete', `${this.apiUrl}/seances/bulk`, {
      body: { ids },
    });
  }

  getCinemasForSalle(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/cinemas`);
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
