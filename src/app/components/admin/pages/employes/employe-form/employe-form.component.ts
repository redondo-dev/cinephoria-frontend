import { Component, OnInit, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminService, Employe } from '../../../services/admin.service';

@Component({
  selector: 'app-employe-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employe-form.component.html',
  styleUrls: ['./employe-form.component.scss'],
})
export class EmployeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  employeForm!: FormGroup;
  submitting = false;
  error: string | null = null;

  employeId: number | null = null;

  @Input() employeToEdit?: Employe;
  @Output() close = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();

  ngOnInit() {
    this.initForm();

    // Vérifie si on a un ID dans l’URL (mode édition par route)
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.employeId = +idParam;
        this.loadEmploye(this.employeId);
      }
    });

    // Vérifie si le composant reçoit un employé à éditer via @Input (mode modal)
    if (this.employeToEdit) {
      this.patchForm(this.employeToEdit);
    }
  }

  // Initialise le formulaire
  initForm() {
    this.employeForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.minLength(6)]], // facultatif si édition
    });
  }

  // Charge un employé depuis l’API si on est en mode édition par route
  loadEmploye(id: number) {
    this.adminService.getEmployeById(id).subscribe({
      next: (data) => this.patchForm(data),
      error: (err) => {
        console.error(' Erreur chargement employé:', err);
        this.error = "Impossible de charger les informations de l'employé.";
      },
    });
  }

//Met à jour le formulaire avec les données de l’employé
  patchForm(data: Employe) {
    this.employeForm.patchValue({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      username: data.username,
      password: '', // ne jamais afficher le hash
    });
  }

  /** Soumission du formulaire */
  onSubmit() {
    if (this.employeForm.invalid) {
      this.employeForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = null;

    const employeData: Employe = this.employeForm.value;

    // --- 🔹 Cas 1 : édition par route (edit/:id) ---
    if (this.employeId) {
      this.adminService.updateEmploye(this.employeId, employeData).subscribe({
        next: () => {
          this.router.navigate(['/admin/employes']);
        },
        error: (err) => {
          this.error = "Erreur lors de la mise à jour de l'employé.";
          this.submitting = false;
          console.error(err);
        },
      });

    // --- 🔹 Cas 2 : modal (via @Input) ---
    } else if (this.employeToEdit) {
      this.adminService.updateEmploye(this.employeToEdit.id!, employeData).subscribe({
        next: () => {
          this.refresh.emit();
          this.close.emit();
        },
        error: (err) => {
          this.error = "Erreur lors de la mise à jour de l'employé.";
          this.submitting = false;
          console.error(err);
        },
      });

    // --- 🔹 Cas 3 : création ---
    } else {
      this.adminService.createEmploye(employeData).subscribe({
        next: () => {
          this.router.navigate(['/admin/employes']);
        },
        error: (err) => {
          this.error =
            "Erreur lors de la création de l'employé. Le login existe peut-être déjà.";
          this.submitting = false;
          console.error(err);
        },
      });
    }
  }

  /** Retour à la liste */
  goBack() {
    this.router.navigate(['/admin/employes']);
  }
}
