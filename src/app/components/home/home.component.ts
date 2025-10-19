import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FilmService, Film } from '../../core/services/film.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  recentFilms: Film[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private filmService: FilmService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecentFilms();
  }

  /**
   * Charge les films ajoutés le dernier mercredi
   */
  loadRecentFilms(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.filmService.getRecentFilms()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (films: Film[]) => {
          this.recentFilms = films;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des films récents:', error);
          this.errorMessage = 'Impossible de charger les films récents. Veuillez réessayer.';
          this.isLoading = false;
        }
      });
  }

  /**
   * Navigation vers la page de tous les films
   */
  navigateToAllFilms(): void {
    this.router.navigate(['/films']);
  }

  /**
   * Navigation vers la page détail d'un film
   */
  navigateToFilmDetail(filmId: string): void {
    this.router.navigate(['/films', filmId]);
  }

  /**
   * Formater la durée en heures et minutes
   */
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  /**
   * Afficher les genres sous forme de string
   */
  getGenresText(genres: string[]): string {
    return genres.join(', ');
  }

  /**
   * Obtenir la classe CSS pour la notation (étoile)
   */
  getRatingClass(rating: number): string {
    if (rating >= 8) return 'rating-high';
    if (rating >= 6) return 'rating-medium';
    return 'rating-low';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
