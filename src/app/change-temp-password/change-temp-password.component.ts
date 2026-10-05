// src/app/change-temp-password/change-temp-password.component.ts

import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

export interface RegleMotDePasse {
  libelle: string;
  ok: boolean;
}

// Mêmes règles que le serveur : 8 caractères, une minuscule, une majuscule, un chiffre
// et un caractère spécial. Le serveur reste l'autorité : il revérifie à l'envoi.
export const evaluerMotDePasse = (motDePasse: string): RegleMotDePasse[] => [
  { libelle: 'Au moins 8 caractères', ok: motDePasse.length >= 8 },
  { libelle: 'Une lettre minuscule', ok: /[a-z]/.test(motDePasse) },
  { libelle: 'Une lettre majuscule', ok: /[A-Z]/.test(motDePasse) },
  { libelle: 'Un chiffre', ok: /\d/.test(motDePasse) },
  { libelle: 'Un caractère spécial (par exemple ! ? @ #)', ok: /[^A-Za-z0-9]/.test(motDePasse) },
];

@Component({
  selector: 'app-change-temp-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-temp-password.component.html',
  styleUrl: './change-temp-password.component.scss',
})
export class ChangeTempPasswordComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private minuteur: ReturnType<typeof setTimeout> | null = null;

  tempPassword = '';
  newPassword = '';
  confirmPassword = '';
  showTemp = false;
  showNew = false;
  showConfirm = false;
  submitting = signal(false);
  success = signal(false);
  error = signal('');
  userEmail = '';

  ngOnInit(): void {
    // Récupérer l'email de l'utilisateur connecté
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.userEmail = user.email;
  }

  ngOnDestroy(): void {
    if (this.minuteur) {
      clearTimeout(this.minuteur);
    }
  }

  get regles(): RegleMotDePasse[] {
    return evaluerMotDePasse(this.newPassword);
  }

  get reglesRespectees(): boolean {
    return this.regles.every((regle) => regle.ok);
  }

  get confirmationCorrespond(): boolean {
    return this.confirmPassword.length > 0 && this.newPassword === this.confirmPassword;
  }

  get differeDuTemporaire(): boolean {
    return !this.tempPassword || this.tempPassword !== this.newPassword;
  }

  get formulaireValide(): boolean {
    return (
      !!this.tempPassword &&
      this.reglesRespectees &&
      this.confirmationCorrespond &&
      this.differeDuTemporaire
    );
  }

  onSubmit(): void {
    if (this.submitting()) {
      return;
    }

    // Le bouton est désactivé tant que le formulaire est invalide, mais la touche Entrée
    // peut quand même soumettre : on explique alors ce qui manque.
    if (!this.tempPassword) {
      this.error.set('Saisissez le mot de passe temporaire reçu par email.');
      return;
    }
    if (!this.reglesRespectees) {
      this.error.set('Le nouveau mot de passe ne respecte pas toutes les règles.');
      return;
    }
    if (!this.confirmationCorrespond) {
      this.error.set('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!this.differeDuTemporaire) {
      this.error.set('Le nouveau mot de passe doit être différent du mot de passe temporaire.');
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    this.authService
      .changeTemporaryPassword(this.userEmail, this.tempPassword, this.newPassword)
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.success.set(true);
          this.tempPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';

          // Le mot de passe a changé : on ferme la session, puis on renvoie vers la connexion
          this.authService.logout();
          this.minuteur = setTimeout(() => this.allerALaConnexion(), 3000);
        },
        error: (err) => {
          this.submitting.set(false);
          console.error('Erreur changement MDP');

          const message =
            err.error?.message || 'Erreur lors du changement de mot de passe';
          this.error.set(message);
        },
      });
  }

  allerALaConnexion(): void {
    if (this.minuteur) {
      clearTimeout(this.minuteur);
      this.minuteur = null;
    }
    this.router.navigate(['/auth/login']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
