import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FilmsService, Film } from '../../services/employes.service';
import { environment } from '../../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

interface Genre {
  id: number;
  nom: string;
}

@Component({
  selector: 'app-films',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './films.component.html',
  styleUrls: ['./films.component.scss'],
})
export class FilmsComponent implements OnInit {
  films: Film[] = [];
  genres: Genre[] = [];
  currentFilm: Film = this.initFilm();
  showForm = false;

  constructor(
    private filmsService: FilmsService,
    private http: HttpClient,
    private toast: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadFilms();
    this.loadGenres();
  }

  loadFilms(): void {
    this.filmsService.getAll().subscribe({
      next: (films) => (this.films = films),
      error: (err) => console.error('Erreur chargement films', err),
    });
  }

  
  loadGenres(): void {
    this.http.get<Genre[]>(`${environment.apiUrl}/api/genres`).subscribe({
      next: (data: any) => (this.genres = data?.data || data || []),
      error: (err) => console.error('Erreur chargement genres', err),
    });
  }

  saveFilm(): void {
    if (this.currentFilm.id) {
      this.filmsService
        .update(this.currentFilm.id, this.currentFilm)
        .subscribe({
          next: () => {
            this.toast.success('Film modifié avec succès');
            this.loadFilms();
            this.resetForm();
          },
          error: (err) => {
            this.toast.error(
              err.message || 'Erreur lors de la modification du film',
            );
            console.error('Erreur modification', err);
          },
        });
    } else {
      this.filmsService.create(this.currentFilm).subscribe({
        next: () => {
          this.toast.success('Film créé avec succès');
          this.loadFilms();
          this.resetForm();
        },
        error: (err) => {
          this.toast.error(err.message || 'Erreur lors de la création du film');
          console.error('Erreur création', err);
        },
      });
    }
  }

  editFilm(film: Film): void {
    this.currentFilm = { ...film, genre_id: film.genres?.[0]?.id };
    this.showForm = true;
  }

  deleteFilm(id: number): void {
    if (confirm('Confirmer la suppression ?')) {
      this.filmsService.delete(id).subscribe({
        next: () => {
          this.toast.success('Film supprimé avec succès');
          this.loadFilms();
        },
        error: (err) => {
          this.toast.error(
            err.message || 'Erreur lors de la suppression du film',
          );
          console.error('Erreur suppression', err);
        },
      });
    }
  }

  resetForm(): void {
    this.currentFilm = this.initFilm();
    this.showForm = false;
  }

  private initFilm(): Film {
    return {
      titre: '',
      duree: 0,
      description: '',
      date_ajout: '',
    };
  }
}
