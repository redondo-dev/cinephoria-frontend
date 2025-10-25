// core/services/reservation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cinema, Film } from '../models/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  //  Routes publiques

  // Gestion des cinemas

  getCinemas(): Observable<Cinema[]> {
    return this.http.get<Cinema[]>(
      `${this.apiUrl}/public/reservations/cinemas`
    );
  }
  // Gestion des films

  getFilmsByCinema(cinema_id: number): Observable<Film[]> {
    return this.http.get<Film[]>(
      `${this.apiUrl}/public/reservations/cinemas/${cinema_id}/films`
    );
  }
  // Gestion des seances
  getSeances(cinemaId: number, filmId: number, nbPersonnes: number) {
    return this.http.get(
      `${this.apiUrl}/public/reservations/cinemas/${cinemaId}/films/${filmId}/seances`,
      { params: { nbPersonnes } }
    );
  }
}
