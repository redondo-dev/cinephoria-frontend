import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilmsService, Film } from '../../services/employes.service';

@Component({
  selector: 'app-films',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './films.component.html',
  styleUrls: ['./films.component.scss'],
})
export class FilmsComponent implements OnInit {
  films: Film[] = [];
  currentFilm: Film = this.initFilm();
  showForm = false;

  constructor(private filmsService: FilmsService) {}

  ngOnInit(): void {
    this.loadFilms();
  }

  loadFilms(): void {
    this.filmsService.getAll().subscribe({
      next: (films) => (this.films = films),
      error: (err) => console.error('Erreur chargement films', err),
    });
  }

  saveFilm(): void {
    if (this.currentFilm.id) {
      this.filmsService
        .update(this.currentFilm.id, this.currentFilm)
        .subscribe({
          next: () => {
            this.loadFilms();
            this.resetForm();
          },
          error: (err) => console.error('Erreur modification', err),
        });
    } else {
      this.filmsService.create(this.currentFilm).subscribe({
        next: () => {
          this.loadFilms();
          this.resetForm();
        },
        error: (err) => console.error('Erreur création', err),
      });
    }
  }

  editFilm(film: Film): void {
    this.currentFilm = { ...film };
    this.showForm = true;
  }

  deleteFilm(id: number): void {
    if (confirm('Confirmer la suppression ?')) {
      this.filmsService.delete(id).subscribe({
        next: () => this.loadFilms(),
        error: (err) => console.error('Erreur suppression', err),
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
