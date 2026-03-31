import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForgotPasswordComponent } from '../../forgot-password/forgot-password.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ForgotPasswordComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  showPassword = false;
  showForgotPassword = signal(false);
  openForgotPassword(): void {
    this.showForgotPassword.set(true);
  }

  closeForgotPassword(): void {
    this.showForgotPassword.set(false);
  }
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkIfAlreadyLoggedIn();
  }

  /**
   * Initialiser le formulaire de login
   */
  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  /**
   * Rediriger si déjà connecté
   */
  private checkIfAlreadyLoggedIn(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  /**
   * Soumettre le formulaire de login
   */
  onSubmit(): void {
    if (!this.loginForm.valid) {
      this.errorMessage = 'Veuillez remplir correctement tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.loginForm.disable();

    const credentials = this.loginForm.value;
    console.log('DEBUG credentials envoyés:', credentials);
    this.authService
      .login(credentials.email, credentials.password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.loginForm.enable();
          this.successMessage = `Bienvenue ${
            response.user.name || response.user.prenom
          }!`;
          //Vérifier si changement MDP requis
          if (response.user.mustChangePassword) {
            this.router.navigate(['/change-password']);
            return;
          }
          /** Redirection selon le rôle **/
          if (response.user.role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else if (
            response.user.role === 'EMPLOYE' ||
            response.user.role === 'employe'
          ) {
            this.router.navigate(['/intranet']);
          } else if (
            response.user.role === 'CLIENT' ||
            response.user.role === 'client'
          ) {
            this.router.navigate(['/mon-espace']);
          } else {
            const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
            sessionStorage.removeItem('redirectAfterLogin');
            if (redirectUrl) {
              this.router.navigateByUrl(redirectUrl);
            } else {
              this.router.navigate(['/']);
            }
          }
        },

        error: (error) => {
          this.isLoading = false;
          this.loginForm.enable();
          this.errorMessage = error.message || ' Erreur lors de la connexion';
          console.error('Erreur login:', error);
        },
      });
  }

  /**
   * Basculer la visibilité du mot de passe
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Obtenir les erreurs du formulaire
   */
  getFieldError(fieldName: string): string | null {
    const field = this.loginForm.get(fieldName);

    if (!field || !field.errors || !field.touched) {
      return null;
    }

    if (field.errors['required']) {
      return `${
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
      } est requis`;
    }

    if (field.errors['email']) {
      return 'Format email invalide';
    }

    if (field.errors['minlength']) {
      return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
    }

    return null;
  }

  /**
   * Vérifier si un champ a une erreur
   */
  hasError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
