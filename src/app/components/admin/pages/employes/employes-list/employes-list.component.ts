// src/app/admin/pages/employes/employes-list/employes-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminService, Employe } from '../../../services/admin.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmployeFormComponent } from '../employe-form/employe-form.component';

@Component({
  selector: 'app-employes-list',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule,EmployeFormComponent],
  templateUrl: './employes-list.component.html',
  styleUrls: ['./employes-list.component.scss'],
})
export class EmployesListComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);

  employes: Employe[] = [];
  loading = true;
  error: string | null = null;

  showResetModal = false;
  selectedEmploye: Employe | null = null;
  newPassword = '';
  resetting = false;
  resetError: string | null = null;
  resetSuccess: string | null = null;

  showFormModal = false; // Ajout modal création/édition
  employeToEdit: Employe | undefined;


  ngOnInit() {
    this.loadEmployes();
  }

  loadEmployes() {
    this.loading = true;
    this.adminService.getEmployes().subscribe({
      next: (data) => {
        this.employes = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des employés';
        this.loading = false;
        console.error(err);
      },
    });
  }

  openResetPasswordModal(employe: Employe) {
    this.selectedEmploye = employe;
    this.newPassword = '';
    this.resetError = null;
    this.resetSuccess = null;
    this.showResetModal = true;
  }

  closeResetModal() {
    this.showResetModal = false;
    this.selectedEmploye = null;
    this.newPassword = '';
    this.resetError = null;
    this.resetSuccess = null;
  }

  resetPassword() {
    if (!this.selectedEmploye?.id || !this.newPassword) {
      return;
    }

    this.resetting = true;
    this.resetError = null;
    this.resetSuccess = null;

    this.adminService
      .resetPasswordEmploye(String(this.selectedEmploye.id), this.newPassword)
      .subscribe({
        next: () => {
          this.resetSuccess = 'Mot de passe réinitialisé avec succès !';
          this.resetting = false;
          setTimeout(() => {
            this.closeResetModal();
          }, 2000);
        },
        error: (err) => {
          this.resetError =
            'Erreur lors de la réinitialisation du mot de passe';
          this.resetting = false;
          console.error(err);
        },
      });
  }
  openCreateModal() {
  this.showFormModal = true;
  this.employeToEdit = undefined;
}
openEditModal(employe: Employe) {
  this.showFormModal = true;
  this.employeToEdit = employe;
}
  onEditEmploye(id?: number): void {
    if (!id) return;
    this.router.navigate(['/admin/employes/edit', id]);
  }

  onDeleteEmploye(id?: number): void {
    if (!id) return;
    if (confirm('Voulez-vous vraiment supprimer cet employé ?')) {
      this.adminService.deleteEmploye(id).subscribe({
        next: () => {
          this.employes = this.employes.filter((e) => e.id !== id);
        },
        error: (err) => {
          console.error('Erreur suppression employé:', err);
        },
      });
    }
  }
}
