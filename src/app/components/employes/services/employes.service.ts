import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// Configuration API
const API_BASE_URL = 'http://localhost:3000/api/employee';

// Interface Film
export interface Film {
  id?: number;
  titre: string;
  description?: string;
  affiche?: string;
  age_min?: number;
  duree: number;
  date_ajout?: string;
  coup_coeur?: boolean;
  note_moyenne?: number;
  nb_avis?: number;
  genre_id?: number;
}

// Interface Seance
export interface Seance {
  id?: number;
  filmId: number; // Correspond à film_id
  salleId: number; // Correspond à salle_id
  date_seance: string;
  dateHeureDebut: string; // Correspond à date_heure_debut
  dateHeureFin: string; // Correspond à date_heure_fin
  filmTitre?: string;
  salleNom?: string;
}

// Interface Salle
export interface Salle {
  id?: number;
  nom: string; // Correspond à nom_salle en BDD
  nombrePlaces: number; // Correspond à capacite en BDD
  cinema_id?: number; // Ajouté
  qualiteProjection:
    | 'Standard'
    | 'IMAX'
    | '2D'
    | '3D'
    | '4DX'
    | 'Dolby Atmos'
    | 'ScreenX'; // Types étendus
}

// Interface Avis
export interface Avis {
  id?: number;
  utilisateur_id: number;
  film_id: number;
  contenu?: string;
  note: number;
  date_avis?: string;
  statut_avis?: 'en_attente' | 'valide' | 'rejete';
  motif_refus?: string;
  date_validation?: string;
  filmTitre?: string;
  userEmail?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FilmsService {
  private apiUrl = `${API_BASE_URL}/films`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Film[]> {
      return this.http.get<{ data: Film[] }>(this.apiUrl)
      .pipe(map(response => response.data));
  }

  getById(id: number): Observable<Film> {
     return this.http.get<{ data: Film }>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  create(film: Film): Observable<Film> {
    return this.http.post<Film>(this.apiUrl, film);
  }

  update(id: number, film: Film): Observable<Film> {
    return this.http.put<Film>(`${this.apiUrl}/${id}`, film);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

// Seances service
@Injectable({
  providedIn: 'root',
})
export class SeancesService {
  private apiUrl = `${API_BASE_URL}/seances`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Seance[]> {
    return this.http.get<{ data: Seance[] }>(this.apiUrl)
      .pipe(map(response => response.data));
  }

  getById(id: number): Observable<Seance> {
  return this.http.get<{ data: Seance }>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  create(seance: Seance): Observable<Seance> {
    return this.http.post<Seance>(this.apiUrl, seance);
  }

  update(id: number, seance: Seance): Observable<Seance> {
    return this.http.put<Seance>(`${this.apiUrl}/${id}`, seance);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
// salles service
@Injectable({
  providedIn: 'root',
})
export class SallesService {
  private apiUrl = `${API_BASE_URL}/salles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Salle[]> {
   return this.http.get<{ data: Salle[] }>(this.apiUrl)
      .pipe(map(response => response.data));
  }

  getById(id: number): Observable<Salle> {
   return this.http.get<{ data: Salle }>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));

  }

  create(salle: Salle): Observable<Salle> {
    return this.http.post<Salle>(this.apiUrl, salle);
  }

  update(id: number, salle: Salle): Observable<Salle> {
    return this.http.put<Salle>(`${this.apiUrl}/${id}`, salle);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
// avis service
@Injectable({
  providedIn: 'root',
})
export class AvisService {
  private apiUrl = `${API_BASE_URL}/avis`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Avis[]> {
  return this.http.get<{ data: Avis[] }>(this.apiUrl)
    .pipe(
      map(response => response.data) // on extrait uniquement le tableau d'avis
    );
  }

  getPending(): Observable<Avis[]> {
    return this.http.get<{data:Avis[]}>(`${this.apiUrl}/en-attente`)
     .pipe(
      map(response => response.data)
     );
  }

  validate(id: number): Observable<Avis> {
    return this.http.patch<Avis>(`${this.apiUrl}/${id}/valider`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
