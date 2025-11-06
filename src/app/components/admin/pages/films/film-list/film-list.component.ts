// src/app/admin/pages/films/films-list/films-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, Film } from '../../../services/admin.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-film-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './film-list.component.html',
  styleUrls: ['./film-list.component.scss'],
})
export class FilmListComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastrService);

  films: Film[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.loadFilms();
  }

  //  Cette méthode doit charger TOUS les films
  loadFilms() {
    this.loading = true;
    this.error = null;

    this.adminService.getFilms().subscribe({
      next: (data) => {
        this.films = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des films';
        this.loading = false;
        console.error('Erreur détaillée:', err);
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
          // CORRECTION : Mettre à jour la liste locale ET recharger pour être sûr
          this.films = this.films.filter((f) => f.id !== film.id);
          this.toast.success('Film supprimé avec succès');
        },
        error: (err) => {
          // CORRECTION : Utiliser toastr au lieu de alert
          this.toast.error('Erreur lors de la suppression du film');
          console.error('Erreur suppression:', err);
        },
      });
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'Date inconnue';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Date invalide';
    }
  }

  trackById(index: number, film: Film) {
    return film.id ?? index;
  }
}
