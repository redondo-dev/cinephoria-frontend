import { CommonModule } from '@angular/common';
import { Component, OnInit,inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminService, Salle } from '../../../services/admin.service';

@Component({
  selector: 'app-salle-from',
    standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './salle-form.component.html',
  styleUrls: ['./salle-form.component.scss'],
})

export class SalleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  salleForm!: FormGroup;
  isEditMode = false;
  salleId: string | null = null;
  loading = false;
  submitting = false;
  error: string | null = null;

  ngOnInit() {
    this.initForm();

    this.salleId = this.route.snapshot.paramMap.get('id');
    if (this.salleId) {
      this.isEditMode = true;
      this.loadSalle(this.salleId);
    }
  }

  initForm() {
    this.salleForm = this.fb.group({
      nom: ['', Validators.required],
      nombrePlaces: [null, [Validators.required, Validators.min(1)]],
      qualiteProjection: ['', Validators.required]
    });
  }

  loadSalle(id: string) {
    this.loading = true;
    this.adminService.getSalle(id).subscribe({
      next: (salle) => {
        this.salleForm.patchValue(salle);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la salle';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit() {
    if (this.salleForm.invalid) {
      Object.keys(this.salleForm.controls).forEach(key => {
        this.salleForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.error = null;

    const salleData: Salle = this.salleForm.value;

    const request = this.isEditMode && this.salleId
      ? this.adminService.updateSalle(this.salleId, salleData)
      : this.adminService.createSalle(salleData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/admin/salles']);
      },
      error: (err) => {
        this.error = `Erreur lors de ${this.isEditMode ? 'la modification' : 'la création'} de la salle`;
        this.submitting = false;
        console.error(err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/salles']);
  }
}
