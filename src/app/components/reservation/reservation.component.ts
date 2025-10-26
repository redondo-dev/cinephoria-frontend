// reservation.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../core/services/reservation.service';
import { Cinema, Film, Seance } from '../../core/models/reservation.model';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit {
  // Données
  cinemas: Cinema[] = [];
  films: Film[] = [];
  seances: Seance[] = [];

  // Sélections
  selectedCinema?: Cinema;
  selectedFilm?: Film;
  selectedSeance?: Seance;
  nombrePersonnes: number = 2;

  // États de chargement
  loadingCinemas = false;
  loadingFilms = false;
  loadingSeances = false;

  // Erreurs
  errorCinemas = '';
  errorFilms = '';
  errorSeances = '';

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadCinemas();
  }

  // ========== GESTION DES CINÉMAS ==========
  loadCinemas(): void {
    this.loadingCinemas = true;
    this.errorCinemas = '';

    this.reservationService.getCinemas().subscribe({
      next: (cinemas) => {
        this.cinemas = cinemas;
        this.loadingCinemas = false;
      },
      error: (error) => {
        this.errorCinemas = 'Erreur lors du chargement des cinémas';
        this.loadingCinemas = false;
        console.error('Erreur cinémas:', error);
      }
    });
  }

  selectCinema(cinema: Cinema): void {
    this.selectedCinema = cinema;
    this.selectedFilm = undefined;
    this.selectedSeance = undefined;
    this.films = [];
    this.seances = [];

    this.loadFilms(cinema.id);
  }

  isCinemaSelected(cinema: Cinema): boolean {
    return this.selectedCinema?.id === cinema.id;
  }

  // ========== GESTION DES FILMS ==========
  loadFilms(cinemaId: number): void {
    this.loadingFilms = true;
    this.errorFilms = '';

    this.reservationService.getFilmsByCinema(cinemaId).subscribe({
      next: (films) => {
        this.films = films;
        this.loadingFilms = false;
      },
      error: (error) => {
        this.errorFilms = 'Erreur lors du chargement des films';
        this.loadingFilms = false;
        console.error('Erreur films:', error);
      }
    });
  }

  selectFilm(film: Film): void {
    this.selectedFilm = film;
    this.selectedSeance = undefined;
    this.seances = [];

    if (this.selectedCinema) {
      this.loadSeances(this.selectedCinema.id, film.id);
    }
  }

  isFilmSelected(film: Film): boolean {
    return this.selectedFilm?.id === film.id;
  }

  // ========== GESTION DES SÉANCES ==========
  loadSeances(cinemaId: number, filmId: number): void {
    this.loadingSeances = true;
    this.errorSeances = '';

    this.reservationService.getSeances(cinemaId, filmId, this.nombrePersonnes).subscribe({
      next: (seances) => {
        this.seances = seances;
        this.loadingSeances = false;
      },
      error: (error) => {
        this.errorSeances = 'Erreur lors du chargement des séances';
        this.loadingSeances = false;
        console.error('Erreur séances:', error);
      }
    });
  }

  selectSeance(seance: Seance): void {
    this.selectedSeance = seance;
    console.log('Séance sélectionnée:', seance);
    // Ici vous pouvez naviguer vers l'étape suivante ou afficher un récapitulatif
  }

  isSeanceSelected(seance: Seance): boolean {
    return this.selectedSeance?.id === seance.id;
  }

  // ========== GESTION DU NOMBRE DE PERSONNES ==========
  onNombrePersonnesChange(): void {
    if (this.selectedCinema && this.selectedFilm) {
      this.loadSeances(this.selectedCinema.id, this.selectedFilm.id);
    }
  }

  // ========== RÉINITIALISATION ==========
  reset(): void {
    this.selectedCinema = undefined;
    this.selectedFilm = undefined;
    this.selectedSeance = undefined;
    this.films = [];
    this.seances = [];
    this.nombrePersonnes = 2;
  }
}
