import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservationService } from '../../../../core/services/reservation.service';
import { SiegeWithStatus } from '../../../../core/models/siege.model';
@Component({
  selector: 'app-payment-card',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-card.component.html',
  styleUrl: './payment-card.component.scss'
})

export class PaymentCardComponent implements OnInit {
  cardForm!: FormGroup;
  reservationData: any;
  selectedSeats: SiegeWithStatus[] = [];
  totalPrice = 0;
  isProcessing = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    // Récupérer les données de réservation
    const data = sessionStorage.getItem('reservationComplete') ||
                 sessionStorage.getItem('reservationIncomplete');

    if (!data) {
      this.router.navigate(['/reservation']);
      return;
    }

    const parsed = JSON.parse(data);
    this.reservationData = parsed;
    this.selectedSeats = parsed.sieges || [];
    this.totalPrice = parsed.total || 0;

    // Initialiser le formulaire
    this.cardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cardHolder: ['', [Validators.required, Validators.minLength(3)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
    });
  }

  /** Formatter le numéro de carte (4 chiffres par groupe) */
  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s/g, '');
    const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    this.cardForm.patchValue({ cardNumber: formattedValue }, { emitEvent: false });
  }

  /** Formatter la date d'expiration (MM/YY) */
  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    this.cardForm.patchValue({ expiryDate: value }, { emitEvent: false });
  }

  /** Soumettre le paiement */
  submitPayment(): void {
    if (this.cardForm.invalid || this.isProcessing) {
      Object.keys(this.cardForm.controls).forEach(key => {
        this.cardForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isProcessing = true;

    // Récupérer l'ID utilisateur (depuis le token ou localStorage)
    const userToken = localStorage.getItem('userToken');
    const userId = this.getUserIdFromToken(userToken);

    if (!userId) {
      alert('Vous devez être connecté pour effectuer un paiement');
      this.router.navigate(['/auth/login']);
      return;
    }

    const reservationPayload = {
      utilisateurId: userId,
      seanceId: this.reservationData.seance.id,
      sieges: this.selectedSeats.map((s) => s.id),
      total: this.totalPrice,
      methodePaiement: 'card',
    };

    // Simuler un délai de traitement du paiement
    setTimeout(() => {
      this.reservationService.createReservation(reservationPayload).subscribe({
        next: (response) => {
          console.log('✅ Réservation créée avec succès:', response);

          // Nettoyer le sessionStorage
          sessionStorage.removeItem('reservationData');
          sessionStorage.removeItem('reservationComplete');
          sessionStorage.removeItem('reservationIncomplete');
          sessionStorage.removeItem('paymentMethod');

          // Rediriger vers la page de succès
          this.router.navigate(['/reservation/success'], {
            queryParams: { reservationId: response.id }
          });
        },
        error: (err) => {
          console.error('❌ Erreur lors de la création de la réservation:', err);
          this.isProcessing = false;
          alert('Erreur lors du paiement. Veuillez réessayer.');
        },
      });
    }, 2000);
  }

  /** Extraire l'ID utilisateur du token (à adapter selon votre implémentation) */
  private getUserIdFromToken(token: string | null): number | null {
    if (!token) return null;

    try {
      // Décoder le JWT pour récupérer l'ID utilisateur
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || null;
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  }

  /** Retour à la sélection du mode de paiement */
  goBack(): void {
    this.router.navigate(['/reservation/payment']);
  }

  /** Vérifier si un champ a une erreur */
  hasError(field: string): boolean {
    const control = this.cardForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  /** Obtenir le message d'erreur pour un champ */
  getErrorMessage(field: string): string {
    const control = this.cardForm.get(field);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Ce champ est requis';
    if (control.errors['pattern']) {
      if (field === 'cardNumber') return 'Numéro de carte invalide (16 chiffres)';
      if (field === 'expiryDate') return 'Format invalide (MM/YY)';
      if (field === 'cvv') return 'CVV invalide (3 chiffres)';
    }
    if (control.errors['minLength']) return 'Nom trop court';

    return 'Champ invalide';
  }
}
