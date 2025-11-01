import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AdminService, Film } from '../../../services/admin.service';

@Component({
  selector: 'app-film-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './film-form.component.html',
  styleUrls: ['./film-form.component.scss']
})
export class FilmFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

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
      duree: [0, [Validators.required, Validators.min(1)]],
      genre: ['', Validators.required],
      datesSortie: ['', Validators.required],
      affiche: [''],
      bandeAnnonce: ['']
    });
  }

  loadFilm(id: string) {
    this.loading = true;
    this.adminService.getFilm(id).subscribe({
      next: (film) => {
        this.filmForm.patchValue({
          ...film,
          datesSortie: film.datesSortie.split('T')[0] // format input date
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du film';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit() {
    if (this.filmForm.invalid) {
      Object.keys(this.filmForm.controls).forEach(key => {
        this.filmForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.error = null;
    const filmData: Film = this.filmForm.value;

    const request = this.isEditMode && this.filmId
      ? this.adminService.updateFilm(this.filmId, filmData)
      : this.adminService.createFilm(filmData);

    request.subscribe({
      next: () => this.router.navigate(['/admin/films']),
      error: (err) => {
        this.error = `Erreur lors de ${this.isEditMode ? 'la modification' : 'la création'} du film`;
        this.submitting = false;
        console.error(err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/films']);
  }
}
