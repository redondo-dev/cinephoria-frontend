import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AdminService, Film } from '../../../services/admin.service';

@Component({
  selector: 'app-film-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './film-form.component.html',
  styleUrls: ['./film-form.component.scss'],
})
export class FilmFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastrService);

  filmForm!: FormGroup;
  isEditMode = false;
  filmId: string | null = null;
  loading = false;
  submitting = false;
  error: string | null = null;

  ngOnInit() {
    this.initForm();
    this.filmId = this.route.snapshot.paramMap.get('id');
    if (this.filmId) {
      this.isEditMode = true;
      this.loadFilm(this.filmId);
    }
  }

  initForm() {
    this.filmForm = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      duree: [null, [Validators.required, Validators.min(1)]],
      genre: ['', Validators.required],
      affiche: [''],
    });
  }

  loadFilm(id: string) {
    this.loading = true;
    this.adminService.getFilm(id).subscribe({
      next: (film) => {
        this.filmForm.patchValue({
          ...film,
        });

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du film';
        this.loading = false;
        console.error(err);
      },
    });
  }
  onSubmit() {
    if (this.filmForm.invalid) {
      Object.keys(this.filmForm.controls).forEach((key) => {
        const control = this.filmForm.get(key);
        control?.markAsTouched();
      });
      this.error = 'Veuillez corriger les erreurs dans le formulaire';
      return;
    }

    this.submitting = true;
    this.error = null;

    const formValue = this.filmForm.value;

    // Préparer les données AVEC LES BONS NOMS DE CHAMPS
    const filmData: any = {
      titre: formValue.titre?.trim(),
      description: formValue.description?.trim(),
      duree: Number(formValue.duree),
      genre_id: this.mapGenreToId(formValue.genre),
      date_ajout: new Date().toISOString(),
    };

    // Champs optionnels - seulement si ils ont une valeur
    if (formValue.affiche?.trim()) {
      filmData.affiche = formValue.affiche.trim();
    }

    console.log('🎬 Données envoyées au backend:', filmData);

    const request =
      this.isEditMode && this.filmId
        ? this.adminService.updateFilm(this.filmId, filmData)
        : this.adminService.createFilm(filmData);

    request.subscribe({
      next: (response) => {
        this.submitting = false;
        this.toast.success(
          `Film ${this.isEditMode ? 'modifié' : 'créé'} avec succès`
        );
        this.router.navigate(['/admin/films']);
      },
      error: (err) => {
        this.submitting = false;
        console.error(' Erreur complète:', err);
        this.error = this.getErrorMessage(err);

        // Afficher le message d'erreur spécifique du backend
        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.status === 400) {
          this.error = 'Données invalides envoyées au serveur';
        } else {
          this.error = `Erreur lors de ${
            this.isEditMode ? 'la modification' : 'la création'
          } du film`;
        }
      },
    });
  }

  // Méthode pour convertir le genre en genre_id
  private mapGenreToId(genre: string): number {
    const genreMap: { [key: string]: number } = {
      Action: 1,
      Comédie: 2,
      Drame: 3,
      'Science-Fiction': 4,
      Horreur: 5,
      Thriller: 6,
      Romance: 7,
      Animation: 8,
      Aventure: 9,
      Fantastique: 10,
    };
    return genreMap[genre] || 1;
  }

  // Méthode pour obtenir un message d'erreur plus précis
  private getErrorMessage(err: any): string {
    if (err.status === 400) {
      return 'Données invalides. Vérifiez les champs obligatoires.';
    } else if (err.status === 409) {
      return 'Un film avec ce titre existe déjà.';
    } else if (err.status >= 500) {
      return 'Erreur serveur. Veuillez réessayer plus tard.';
    } else {
      return `Erreur lors de ${
        this.isEditMode ? 'la modification' : 'la création'
      } du film`;
    }
  }
  goBack() {
    this.router.navigate(['/admin/films']);
  }
}
