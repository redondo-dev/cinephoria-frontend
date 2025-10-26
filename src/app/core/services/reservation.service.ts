// core/services/reservation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cinema, Film, Seance } from '../models/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  // Étape 1 : Récupérer la liste des cinémas
  getCinemas(): Observable<Cinema[]> {
    return this.http.get<Cinema[]>(
      `${this.apiUrl}/public/reservations/cinemas`
    );
  }

  // Étape 2 : Récupérer les films d'un cinéma
  getFilmsByCinema(cinemaId: number): Observable<Film[]> {
    return this.http.get<Film[]>(
      `${this.apiUrl}/public/reservations/cinemas/${cinemaId}/films`
    );
  }

  // Étape 3 : Récupérer les séances pour un cinéma et un film
  getSeances(cinemaId: number, filmId: number, nbPersonnes: number): Observable<Seance[]> {
    return this.http.get<Seance[]>(
      `${this.apiUrl}/public/reservations/cinemas/${cinemaId}/films/${filmId}/seances`,
      { params: { nbPersonnes: nbPersonnes.toString() } }
    );
  }
}
