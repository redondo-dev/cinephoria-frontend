import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';




@Component({
  selector: 'app-forgot-password',
  standalone:true,
  imports: [CommonModule,FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
private authService = inject(AuthService);

  email = '';
  submitting = signal(false);
  error = signal('');
  success = signal(false);

  onSubmit(): void {
    if (!this.email.trim()) {
      this.error.set('Veuillez entrer votre email');
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    this.authService.resetPassword(this.email).subscribe({
      next: () => {
        this.success.set(true);
        this.submitting.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors de l\'envoi de l\'email');
        this.submitting.set(false);
        console.error(err);
      }
    });
  }

  close(): void {
this.success.set(false);
  this.email = '';
  this.error.set('');
  }
}

