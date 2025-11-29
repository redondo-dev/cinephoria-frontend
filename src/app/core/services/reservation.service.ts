// core/services/reservation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cinema, Film, Seance, Reservation } from '../models/reservation.model';
import { SiegeWithStatus } from '../models/siege.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/api`;

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
  getSeances(
    cinemaId: number,
    filmId: number,
    nbPersonnes: number
  ): Observable<Seance[]> {
    const params = new HttpParams().set('nbPersonnes', nbPersonnes.toString());

    console.log('🎬 Appel API séances:', {
      cinemaId,
      filmId,
      nbPersonnes,
      url: `${this.apiUrl}/public/reservations/cinemas/${cinemaId}/films/${filmId}/seances`,
      params: params.toString(),
    });
    return this.http.get<Seance[]>(
      `${this.apiUrl}/public/reservations/cinemas/${cinemaId}/films/${filmId}/seances`,
      { params }
    );
  }

  // Étape 4 : Récupérer les sièges d'une séance
  getSiegesBySeance(seanceId: number): Observable<SiegeWithStatus[]> {
    return this.http.get<SiegeWithStatus[]>(
      `${this.apiUrl}/public/reservations/seances/${seanceId}/sieges`
    );
  }

  // Étape 5 : Créer une réservation
  createReservation(reservationData: {
    utilisateurId: number;
    seanceId: number;
    sieges: number[]; // IDs des sièges sélectionnés
    total: number;
  }): Observable<Reservation> {
    return this.http.post<Reservation>(
      `${this.apiUrl}/reservations`,
      reservationData
    );
  }

  // Étape 6 : Récupérer une réservation par ID
  getReservationById(reservationId: number): Observable<Reservation> {
    return this.http.get<Reservation>(
      `${this.apiUrl}/reservations/${reservationId}`
    );
  }
}
