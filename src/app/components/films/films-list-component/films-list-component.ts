import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FilmService, Film, Genre } from '../../../core/services/film.service';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-films-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './films-list-component.html',
  styleUrls: ['./films-list-component.scss'],
})
export class FilmsListComponent implements OnInit, OnDestroy {
  // Données
  films: Film[] = [];
  filteredFilms: Film[] = [];

  // Pagination
  currentPage = 1;
  itemsPerPage = 20;
  totalFilms = 0;
  totalPages = 0;

  // Filtres
  searchTerm = '';
  selectedGenre = '';
  selectedCinema = '';
  selectedDate = '';
  sortBy = 'recent'; // recent, rating, title
  genres: string[] = [];
  cinemas: string[] = [];
  availableDates: string[] = [];

  // États
  isLoading = false;
  errorMessage: string | null = null;

  // View mode
  viewMode: 'grid' | 'list' = 'grid';

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private filmService: FilmService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.setupSearch();
    this.loadQueryParams();
    this.loadFilms();
    this.loadCinemas();
    this.loadAvailableDates();
  }

  /**
   * Configuration de la recherche avec debounce
   */
  private setupSearch(): void {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.searchTerm = searchTerm;
        this.currentPage = 1;
        this.applyFilters();
      });
  }

  /**
   * Charger les paramètres de l'URL
   */
  private loadQueryParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.selectedGenre = params['genre'] || '';
        this.searchTerm = params['search'] || '';
        this.sortBy = params['sort'] || 'recent';
        this.currentPage = +params['page'] || 1;
      });
  }

  /**
   * Charger tous les films
   */
  loadFilms(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const filters = {
      genre: this.selectedGenre,
      cinema:this.selectedCinema,
      date:this.selectedDate,
      search: this.searchTerm,
    };

    this.filmService
      .getAllFilms(this.currentPage, this.itemsPerPage, filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.films = response.films;
          this.totalFilms = response.total;
          this.totalPages = Math.ceil(this.totalFilms / this.itemsPerPage);
          this.extractGenres();
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur chargement films:', error);
          this.errorMessage =
            'Impossible de charger les films. Veuillez réessayer.';
          this.isLoading = false;
        },
      });
  }

/**
   * NOUVEAU - Charger la liste des cinémas
   */
  private loadCinemas(): void {
    this.filmService
      .getCinemas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cinemas) => {
          this.cinemas = cinemas;
        },
        error: (error) => {
          console.error('Erreur chargement cinémas:', error);
        },
      });
  }

  /**
   * NOUVEAU - Charger les dates disponibles
   */
  private loadAvailableDates(): void {
    this.filmService
      .getAvailableDates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dates) => {
          this.availableDates = dates;
        },
        error: (error) => {
          console.error('Erreur chargement dates:', error);
        },
      });
  }


  /**
   * Extraire tous les genres uniques
   */
  private extractGenres(): void {
    const genresSet = new Set<string>();
    if (this.films && Array.isArray(this.films)) {
      // ← Ajouter cette vérification
      this.films.forEach((film) => {
        if (film.genre?.nom) {
          genresSet.add(film.genre.nom);
        }
      });
    }
    this.genres = Array.from(genresSet).sort();
  }

  /**
   * Appliquer les filtres et le tri
   */
  applyFilters(): void {
    if (!this.films || !Array.isArray(this.films)) {
      // ← Ajouter cette vérification
      this.filteredFilms = [];
      return;
    }

    let filtered = [...this.films];

    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (film) =>
          film.titre.toLowerCase().includes(term) ||
          film.description.toLowerCase().includes(term) ||
          (film.genre?.nom && film.genre.nom.toLowerCase().includes(term))
      );
    }

    // Filtre par genre
    if (this.selectedGenre) {
      filtered = filtered.filter(
        (film) => film.genre?.nom === this.selectedGenre
      );
    }
 //Filtre par cinéma
    if (this.selectedCinema) {
      filtered = filtered.filter(
        (film) => film.cinema === this.selectedCinema
      );
    }

    //  Filtre par date
    if (this.selectedDate) {
      filtered = filtered.filter((film) =>
        film.seances?.some((seance: any) => seance.date === this.selectedDate)
      );
    }
    // Tri
    filtered = this.sortFilms(filtered);

    this.filteredFilms = filtered;
    this.updateURL();
  }
  /**
   * Trier les films
   */
  private sortFilms(films: Film[]): Film[] {
    switch (this.sortBy) {
      case 'rating':
        return films.sort(
          (a, b) => (b.note_moyenne ?? 0) - (a.note_moyenne ?? 0)
        );
      case 'title':
        return films.sort((a, b) => a.titre.localeCompare(b.titre));
      case 'year':
        return films.sort((a, b) => (b.annee ?? 0) - (a.annee ?? 0));
      case 'recent':
      default:
        return films.sort(
          (a, b) =>
            new Date(b.dateAjout).getTime() - new Date(a.dateAjout).getTime()
        );
    }
  }

  /**
   * Mettre à jour l'URL avec les filtres
   */
  private updateURL(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        genre: this.selectedGenre || null,
         cinema: this.selectedCinema || null,
        date: this.selectedDate || null,
        search: this.searchTerm || null,
        sort: this.sortBy,
        page: this.currentPage,
      },
      queryParamsHandling: 'merge',
    });
  }

  /**
   * Gestion de la recherche
   */
  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  /**
   * Changer de genre
   */
  onGenreChange(genre: string): void {
    this.selectedGenre = genre;
    this.currentPage = 1;
    this.applyFilters();
  }
/**
   *  Changer de cinéma
   */
  onCinemaChange(cinema: string): void {
    this.selectedCinema = cinema;
    this.currentPage = 1;
    this.applyFilters();
  }

  /**
   *  Changer de date
   */
  onDateChange(date: string): void {
    this.selectedDate = date;
    this.currentPage = 1;
    this.applyFilters();
  }
  /**
   * Changer le tri
   */
  onSortChange(sortBy: string): void {
    this.sortBy = sortBy;
    this.applyFilters();
  }

  /**
   * Réinitialiser les filtres
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedGenre = '';
     this.selectedCinema = '';
    this.selectedDate = '';
    this.sortBy = 'recent';
    this.currentPage = 1;
    this.applyFilters();
  }

  /**
   * Pagination
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadFilms();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  /**
   * Changer le mode d'affichage
   */
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  /**
   * Navigation vers le détail
   */
  navigateToDetail(filmId: string): void {
    this.router.navigate(['/films', filmId]);
  }

  /**
   * Obtenir les pages à afficher dans la pagination
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Formater la durée
   */
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  /**
   * Obtenir le texte des genres
   */
  getGenresText(genre?: Genre): string {
    return genre ? genre.nom : 'Non spécifié';
  }

  /**
   * Classe CSS pour la note
   */
  getRatingClass(rating?: number): string {
    if (!rating) return 'rating-low';
    if (rating >= 8) return 'rating-high';
    if (rating >= 6) return 'rating-medium';
    return 'rating-low';
  }

/**
   * NOUVEAU - Formater la date pour affichage
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }




  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
