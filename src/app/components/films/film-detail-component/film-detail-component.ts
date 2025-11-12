import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FilmService, Film } from '../../../core/services/film.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  SeancesListComponent,
  Seance,
} from '../../seances/seances-list-component/seances-list.component';

@Component({
  selector: 'app-film-detail',
  standalone: true,
  imports: [CommonModule, RouterModule,SeancesListComponent],
  templateUrl: './film-detail-component.html',
  styleUrls: ['./film-detail-component.scss'],
})
export class FilmDetailComponent implements OnInit, OnDestroy {
  film: Film | null = null;
  filmId!: string;
  similarFilms: Film[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  isFavorite = false;

  private destroy$ = new Subject<void>();

  constructor(
    private filmService: FilmService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.filmId = id;
        this.loadFilm();
      } else {
        this.errorMessage = 'ID du film invalide';
      }
    });

    this.checkIfFavorite();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFilm(): void {
    if (!this.filmId) {
      this.errorMessage = 'ID du film invalide';
      return;
    }

    const filmIdNum = +this.filmId;
    this.isLoading = true;
    this.errorMessage = null;

    this.filmService
      .getFilmById(filmIdNum)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (film) => {
          this.film = film;
          this.isLoading = false;
          this.loadSimilarFilms();
        },
        error: (error) => {
          console.error('Erreur chargement film:', error);
          this.errorMessage = 'Impossible de charger les détails du film.';
          this.isLoading = false;
        },
      });
  }

  loadSimilarFilms(): void {
    const genreId = this.film?.genre?.id;
    if (genreId === undefined) return;

    const filmIdNum = Number(this.filmId);

    this.filmService
      .getAllFilms(1, 6, { genre: genreId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.similarFilms = response.films
            .filter((f) => f.id !== this.filmId)
            .slice(0, 5);
        },
        error: (error) =>
          console.error('Erreur chargement films similaires:', error),
      });
  }

  /**
   *  Formater les séances pour le composant SeancesListComponent
   */
  formatSeancesForDisplay(): Seance[] {
    if (!this.film?.seances || this.film.seances.length === 0) {
      return [];
    }

    return this.film.seances.map((seance: any) => ({
      id: seance.id.toString(),
      date: seance.date_seance,
      heure_debut: this.extractTime(seance.dateHeureDebut),
      heure_fin: this.extractTime(seance.dateHeureFin),
      qualite: (seance.salle?.qualite_projection || 'Standard') as
        | 'Standard'
        | '3D'
        | 'IMAX'
        | 'VIP',
      prix: this.getPrixByQualite(seance.salle?.qualite_projection),
      places_disponibles: seance.salle?.capacite || 0,
      salle: seance.salle?.nom_salle || 'N/A',
    }));
  }

  /**
   *  Extraire l'heure au format HH:MM
   */
  private extractTime(dateTime: string | Date): string {
    if (!dateTime) return '00:00';
    const date = new Date(dateTime);
    return date.toTimeString().substring(0, 5);
  }

  /**
   * Obtenir le prix selon la qualité
   */
  private getPrixByQualite(qualite?: string): number {
    const prices: Record<string, number> = {
      Standard: 9.5,
      '3D': 12.5,
      IMAX: 15.0,
      VIP: 18.0,
    };
    return prices[qualite || 'Standard'] || 9.5;
  }
   /**
   * Réserver une place
   */
  bookTicket(): void {
    if (this.film) {
      // Si le film a des séances, rediriger vers la première séance
      if (this.film.seances && this.film.seances.length > 0) {
        const firstSeance = this.film.seances[0];
        this.router.navigate(['/reservation/sieges', firstSeance.id]);
      } else {
        // Sinon, rediriger vers la page de sélection générale
        this.router.navigate(['/reservation/selection'], {
          queryParams: { filmId: this.film.id }
        });
      }
    }
  }

  checkIfFavorite(): void {
    const favorites: string[] = JSON.parse(
      localStorage.getItem('favorites') || '[]'
    );
    this.isFavorite = this.filmId ? favorites.includes(this.filmId) : false;
  }

  toggleFavorite(): void {
    let favorites: string[] = JSON.parse(
      localStorage.getItem('favorites') || '[]'
    );
    if (this.isFavorite) {
      favorites = favorites.filter((id) => id !== this.filmId);
      this.isFavorite = false;
    } else {
      favorites.push(this.filmId);
      this.isFavorite = true;
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }

  shareFilm(): void {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => alert(' Lien copié dans le presse-papier!'))
      .catch(() => alert(' Impossible de copier le lien'));
  }


  navigateToFilm(filmId: string): void {
    this.router.navigate(['/films', filmId]);
  }

  goBack(): void {
    this.router.navigate(['/films']);
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  getGenresText(genres: string[]): string {
    return genres.join(' • ');
  }

  getRatingClass(rating?: number): string {
    if (!rating) return 'rating-low';
    if (rating >= 8) return 'rating-high';
    if (rating >= 6) return 'rating-medium';
    return 'rating-low';
  }

  getRatingStars(rating?: number): string[] {
    const r = rating ?? 0;
    const fullStars = Math.floor(r / 2);
    const hasHalfStar = r % 2 >= 1;
    const stars: string[] = [];
    for (let i = 0; i < fullStars; i++) stars.push('full');
    if (hasHalfStar) stars.push('half');
    while (stars.length < 5) stars.push('empty');
    return stars;
  }
}
