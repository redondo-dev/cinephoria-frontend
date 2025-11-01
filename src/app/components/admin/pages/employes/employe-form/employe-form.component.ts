import { Component, OnInit, inject } from '@angular/core'; // inject direct
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, Employe } from '../../../services/admin.service';

@Component({
  selector: 'app-employe-form',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './employe-form.component.html',
  styleUrls: ['./employe-form.component.scss'],
})
export class EmployeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private router = inject(Router);

  employeForm!: FormGroup;
  submitting = false;
  error: string | null = null;

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.employeForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      login: ['', [Validators.required, Validators.minLength(3)]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.employeForm.invalid) {
      Object.keys(this.employeForm.controls).forEach((key) => {
        this.employeForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.error = null;

    const employeData: Employe = this.employeForm.value;

    this.adminService.createEmploye(employeData).subscribe({
      next: () => {
        this.router.navigate(['/admin/employes']);
      },
      error: (err: unknown) => {
        this.error =
          "Erreur lors de la création de l'employé. Le login existe peut-être déjà.";
        this.submitting = false;
        console.error(err as any);
      },
    });
  }

  goBack() {
    this.router.navigate(['/admin/employes']);
  }
}
