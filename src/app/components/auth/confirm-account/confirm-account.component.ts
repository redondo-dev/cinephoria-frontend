import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-confirm-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-account.component.html',
  styleUrl: './confirm-account.component.scss',
})
export class ConfirmAccountComponent implements OnInit {
  status: 'loading' | 'success' | 'error' = 'loading';
  message = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.status = 'error';
      this.message = 'Lien de confirmation invalide.';
      return;
    }

    this.http
      .get<{ message: string }>(`${environment.apiUrl}/api/auth/confirm/${token}`)
      .subscribe({
        next: (res) => {
          this.status = 'success';
          this.message = res.message || 'Compte confirmé avec succès.';
        },
        error: (err) => {
          this.status = 'error';
          this.message =
            err.error?.message || 'Le lien de confirmation est invalide ou a expiré.';
        },
      });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
