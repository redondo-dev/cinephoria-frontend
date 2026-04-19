// src/app/admin/pages/seances/seance-form/seance-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  AdminService,
  Seance,
  Film,
  Salle,
} from '../../../services/admin.service';

@Component({
  selector: 'app-seance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seance-form.component.html',
  styleUrls: ['./seance-form.component.scss'],
})
export class SeanceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  seanceForm!: FormGroup;
  films: Film[] = [];
  salles: Salle[] = [];
  selectedSalle: Salle | null = null;
  selectedFilm: Film | null = null;

  isEditMode = false;
  seanceId: string | null = null;
  loading = false;
  submitting = false;
  error: string | null = null;

  ngOnInit() {
    this.initForm();
    this.loadFilmsAndSalles();

    this.seanceId = this.route.snapshot.paramMap.get('id');
    if (this.seanceId) {
      this.isEditMode = true;
    }
  }

  initForm() {
    this.seanceForm = this.fb.group({
      filmId: ['', Validators.required],
      salleId: ['', Validators.required],
      date: ['', Validators.required],
      heure: ['', Validators.required],
      prix: [0, [Validators.required, Validators.min(0.01)]],
    });
  }

  loadFilmsAndSalles() {
    this.loading = true;

    Promise.all([
      this.adminService.getFilms().toPromise(),
      this.adminService.getSalles().toPromise(),
    ])
      .then(([films, salles]) => {
        this.films = films || [];
        this.salles = salles || [];

        if (this.isEditMode && this.seanceId) {
          this.loadSeance(this.seanceId);
        } else {
          this.loading = false;
        }
      })
      .catch((err) => {
        this.error = 'Erreur lors du chargement des données';
        this.loading = false;
        console.error(err);
      });
  }

  loadSeance(id: string) {
    this.adminService.getSeance(id).subscribe({
      next: (seance) => {
        const dateTime = new Date(seance.date_seance);
        this.seanceForm.patchValue({
          filmId: seance.filmId,
          salleId: seance.salleId,
          date: dateTime.toISOString().split('T')[0],
          heure: dateTime.toTimeString().substring(0, 5),
          prix: seance.prix,
        });
        this.onSalleChange();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la séance';
        this.loading = false;
        console.error(err);
      },
    });
  }

  onSalleChange() {
    const salleId = this.seanceForm.get('salleId')?.value;
    this.selectedSalle = this.salles.find((s) => s.id === salleId) || null;
  }

  onFilmChange() {
    const filmId = this.seanceForm.get('filmId')?.value;
    this.selectedFilm = this.films.find((f) => f.id === filmId) || null;
  }
  onSubmit() {
    if (this.seanceForm.invalid) {
      Object.keys(this.seanceForm.controls).forEach((key) => {
        this.seanceForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.error = null;

    const formValue = this.seanceForm.value;
    // Date de début
    const dateDebut = new Date(`${formValue.date}T${formValue.heure}:00`);

    // Date de fin = début + durée du film (en minutes)
    const dureeMinutes = this.selectedFilm?.duree || 0;
    const dateFin = new Date(dateDebut.getTime() + dureeMinutes * 60 * 1000);

    const seanceData = {
      filmId: parseInt(formValue.filmId),
      salleId: parseInt(formValue.salleId),
      date_seance: dateDebut.toISOString(),
      dateHeureFin: dateFin.toISOString(),
      prix: parseFloat(formValue.prix),
      placesDisponibles: this.selectedSalle?.nombrePlaces || 0,
    } as Seance;
    console.log('SEANCE ENVOYÉE:', seanceData);
    const request =
      this.isEditMode && this.seanceId
        ? this.adminService.updateSeance(this.seanceId, seanceData)
        : this.adminService.createSeance(seanceData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/admin/seances']);
      },
      error: (err) => {
        console.error('DETAIL ERREUR:', err.error);

        this.error = `Erreur lors de ${
          this.isEditMode ? 'la modification' : 'la création'
        } de la séance`;
        this.submitting = false;
        console.error(err);
      },
    });
  }

  goBack() {
    this.router.navigate(['/admin/seances']);
  }
}
