// src/app/auth/change-temp-password/change-temp-password.component.ts

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-change-temp-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-temp-password.component.html',
  styleUrl: './change-temp-password.component.scss',
})
export class ChangeTempPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  tempPassword = '';
  newPassword = '';
  confirmPassword = '';
  submitting = signal(false);
  error = signal('');
  userEmail = '';

  ngOnInit(): void {
    // Récupérer l'email de l'utilisateur connecté
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/connexion']);
      return;
    }
    this.userEmail = user.email;
  }

  onSubmit(): void {
    // Validation
    if (!this.tempPassword || !this.newPassword || !this.confirmPassword) {
      this.error.set('Veuillez remplir tous les champs');
      return;
    }

    if (this.newPassword.length < 8) {
      this.error.set(
        'Le nouveau mot de passe doit contenir au moins 6 caractères'
      );
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Les mots de passe ne correspondent pas');
      return;
    }

    if (this.tempPassword === this.newPassword) {
      this.error.set(
        'Le nouveau mot de passe doit être différent du mot de passe temporaire'
      );
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    // Appel API
    this.authService
      .changeTemporaryPassword(
        this.userEmail,
        this.tempPassword,
        this.newPassword
      )
      .subscribe({
        next: () => {
          this.submitting.set(false);
          alert(
            'Mot de passe changé avec succès ! Vous pouvez maintenant utiliser votre nouveau mot de passe.'
          );

          // Déconnecter et rediriger vers login
          this.authService.logout();
          this.router.navigate(['/connexion']);
        },
        error: (err) => {
          this.submitting.set(false);
          console.error('Erreur changement MDP:', err);

          const message =
            err.error?.message || 'Erreur lors du changement de mot de passe';
          this.error.set(message);
        },
      });
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/connexion']);
  }
}
