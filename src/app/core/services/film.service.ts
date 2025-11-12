import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cinema {
  id: number;
  nom: string;
  ville: string;
}

export interface Genre {
  id: number;
  nom: string;
}

export interface Film {
  id: string;
  titre: string;
  affiche: string;
  note_moyenne?: number;
  genre?: Genre;
  duree: number;
  dateAjout: string;
  description: string;
  annee: number;
  age_min?: number;
  coup_coeur?: boolean;
  cinema?: Cinema;
  seances?: any[];
}

export interface FilmsResponse {
  films: Film[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FilmFilters {
  genre?: string;
  search?: string;
  minRating?: number;
  maxRating?: number;
  year?: number;
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
  // getAllFilms(
  //   page = 1,
  //   limit = 20,
  //   filters?: any
  // ): Observable<{ films: Film[]; total: number }> {
  //   let params = new HttpParams()
  //     .set('page', page.toString())
  //     .set('limit', limit.toString());

  //   if (filters?.genre) {
  //     params = params.set('genre', filters.genre);
  //   }
  //   if (filters?.search) {
  //     params = params.set('search', filters.search);
  //   }

  //   return this.http.get<{ films: Film[]; total: number }>(this.apiUrl, {
  //     params,
  //   });
  // }

  // Récupère les films les mieux notés
  getAllFilms(
    page: number,
    limit: number,
    filters?: any
  ): Observable<{ films: Film[]; total: number }> {
    let params = new HttpParams().set('page', page).set('limit', limit);

    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key]) params = params.set(key, filters[key]);
      });
    }

    return this.http.get<{ films: Film[]; total: number }>(this.apiUrl, {
      params,
    });
  }

  getFilmById(id: number): Observable<Film> {
    return this.http.get<Film>(`${this.apiUrl}/${id}`);
  }

  getTopRatedFilms(limit = 10): Observable<Film[]> {
    const params = new HttpParams()
      .set('sort', 'rating')
      .set('order', 'desc')
      .set('limit', limit.toString());

    return this.http.get<Film[]>(this.apiUrl, { params });
  }

  //Récupère les dernières sorties

  getLatestFilms(limit = 10): Observable<Film[]> {
    const params = new HttpParams()
      .set('sort', 'dateAjout')
      .set('order', 'desc')
      .set('limit', limit.toString());

    return this.http.get<Film[]>(this.apiUrl, { params });
  }
  //Récupère des films similaires
  getSimilarFilms(filmId: string, limit = 6): Observable<Film[]> {
    return this.http.get<Film[]>(`${this.apiUrl}/${filmId}/similar`, {
      params: new HttpParams().set('limit', limit.toString()),
    });
  }
  //Récupère tous les genres disponibles
  getGenres(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/genres`);
  }

  // Ajouter un film aux favoris (API)
  addToFavorites(filmId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${filmId}/favorite`, {});
  }
  // Récupère tous les cinémas
  getCinemas(): Observable<Cinema[]> {
    return this.http.get<Cinema[]>(`${environment.apiUrl}/api/cinemas`);
  }

  //  Récupère les dates disponibles pour les séances
  getAvailableDates(): Observable<string[]> {
    console.log('URL appelée:', `${environment.apiUrl}/api/seances/dates`);
    return this.http.get<string[]>(`${environment.apiUrl}/api/seances/dates`);
  }

  // Récupère les films coup de coeur
  getFavoriteFilms(): Observable<Film[]> {
    const params = new HttpParams().set('coup_coeur', 'true');
    return this.http.get<Film[]>(this.apiUrl, { params });
  }
  //Retirer un film des favoris (API)

  removeFromFavorites(filmId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${filmId}/favorite`);
  }

  // Noter un film

  rateFilm(filmId: string, rating: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${filmId}/rate`, { rating });
  }

  //Ajouter un commentaire
  addComment(filmId: string, comment: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${filmId}/comments`, { comment });
  }

  //Récupérer les commentaires d'un film

  getComments(filmId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${filmId}/comments`);
  }
}
