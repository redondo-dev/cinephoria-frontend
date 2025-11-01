// src/app/admin/pages/employes/employes-list/employes-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService, Employe } from '../../../services/admin.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employes-list',
  standalone: true,
  imports : [RouterLink, FormsModule, CommonModule],
  templateUrl: './employes-list.component.html',
  styleUrls: ['./employes-list.component.scss'],
})
export class EmployesListComponent implements OnInit {
  private adminService = inject(AdminService);

  employes: Employe[] = [];
  loading = true;
  error: string | null = null;

  showResetModal = false;
  selectedEmploye: Employe | null = null;
  newPassword = '';
  resetting = false;
  resetError: string | null = null;
  resetSuccess: string | null = null;

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
}
