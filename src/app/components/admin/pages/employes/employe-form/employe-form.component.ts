import {
  Component,
  OnInit,
  inject,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminService, Employe } from '../../../services/admin.service';
import { ToastrService } from 'ngx-toastr';
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
  private toastr = inject(ToastrService);

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
      password: ['', [Validators.minLength(6)]],
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
      password: '', 
    });
  }

  /** Soumission du formulaire */
  onSubmit(): void {
    if (this.employeForm.invalid) return;

    const employeData = this.employeForm.value;

    console.log('Données envoyées :', employeData); // 👈 Vérifie ici dans la console

    this.adminService.createEmploye(employeData).subscribe({
      next: (res: any) => {
        console.log('Employé créé', res);
        this.toastr.success(res.message, 'Employé ajouté avec succès');
         this.router.navigate(['/admin/employes']);
      },
      error: (err) => {
        console.error('Erreur API AdminService :', err);
        this.toastr.error(err.message || 'Erreur lors de l’ajout');

      },
    });
  }

  /** Retour à la liste */
  goBack() {
    this.router.navigate(['/admin/employes']);
  }
}
