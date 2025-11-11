import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FilmService, Film } from '../../../core/services/film.service';
import { SeancesListComponent } from '../seances-list-component/seances-list.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-film-detail',
  standalone: true,
  imports: [CommonModule, RouterModule,SeancesListComponent],
  templateUrl: './film-detail-component.html',
  styleUrls: ['./film-detail-component.scss'],
})
export class FilmDetailComponent implements OnInit, OnDestroy {
  filmId!: string;
  film: Film | null = null;
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

    const filmIdNum = +this.filmId; // ✅ conversion en nombre
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

  bookTicket(): void {
    if (!this.film) return;
    this.router.navigate(['/reservation'], {
      queryParams: { filmId: this.filmId },
    });
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
