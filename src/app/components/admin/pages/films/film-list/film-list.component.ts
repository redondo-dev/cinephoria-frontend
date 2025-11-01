// src/app/admin/pages/films/films-list/films-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, Film } from '../../../services/admin.service';

@Component({
  selector: 'app-film-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './film-list.component.html',
  styleUrls: ['./film-list.component.scss'],
})
export class FilmListComponent  implements OnInit {
  private adminService = inject(AdminService);

  films: Film[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.loadFilms();
  }

  loadFilms() {
    this.loading = true;
    this.adminService.getFilms().subscribe({
      next: (data) => {
        this.films = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des films';
        this.loading = false;
        console.error(err);
      },
    });
  }

  deleteFilm(film: Film) {
    if (
      !confirm(`Êtes-vous sûr de vouloir supprimer le film "${film.titre}" ?`)
    ) {
      return;
    }

    if (film.id) {
      this.adminService.deleteFilm(film.id).subscribe({
        next: () => {
          this.films = this.films.filter((f) => f.id !== film.id);
        },
        error: (err) => {
          alert('Erreur lors de la suppression du film');
          console.error(err);
        },
      });
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
  }

  trackById(index: number, film: Film) {
  return film.id??index;
}
}
