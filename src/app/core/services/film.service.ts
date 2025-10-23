import { environment} from './../../../environments/.environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Film {
  id: string;
  titre: string;
  affiche: string;
  note_moyenne?: number;
  genre?: string[];
  duree: number;
  dateAjout: string;
  description: string;
  année: number;
}

@Injectable({
  providedIn: 'root',
})
export class FilmService {
  private apiUrl = `${environment.apiUrl}/api/films`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère les films ajoutés le dernier mercredi
   */
  getRecentFilms(): Observable<Film[]> {
    const params = new HttpParams().set('recent', 'true');
    return this.http.get<Film[]>(this.apiUrl, { params });
  }

  /**
   * Récupère tous les films avec pagination et filtres
   */
  getAllFilms(
    page = 1,
    limit = 20,
    filters?: any
  ): Observable<{ films: Film[]; total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters?.genre) {
      params = params.set('genre', filters.genre);
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<{ films: Film[]; total: number }>(this.apiUrl, {
      params,
    });
  }

  /**
   * Récupère un film par son ID
   */
  getFilmById(id: string): Observable<Film> {
    return this.http.get<Film>(`${this.apiUrl}/${id}`);
  }
}
