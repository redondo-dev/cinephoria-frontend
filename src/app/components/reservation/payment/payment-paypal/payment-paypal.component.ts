import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservationService } from '../../../../core/services/reservation.service';
import { SiegeWithStatus } from '../../../../core/models/siege.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-paypal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-paypal.component.html',
  styleUrls: ['./payment-paypal.component.scss'],
})
export class PaymentPaypalComponent implements OnInit {
  reservationData: any;
  selectedSeats: SiegeWithStatus[] = [];
  totalPrice = 0;
  isProcessing = false;
  paypalEmail = '';
  step: 'email' | 'processing' | 'redirecting' = 'email';

  constructor(
    private router: Router,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    const data =
      sessionStorage.getItem('reservationComplete') ||
      sessionStorage.getItem('reservationIncomplete');

    if (!data) {
      this.router.navigate(['/reservation']);
      return;
    }

    const parsed = JSON.parse(data);
    this.reservationData = parsed;
    this.selectedSeats = parsed.sieges || [];
    this.totalPrice = parsed.total || 0;
  }

  /** Soumettre le paiement PayPal */
  submitPayment(): void {
    if (!this.paypalEmail || this.isProcessing) {
      alert('Veuillez entrer votre email PayPal');
      return;
    }

    // Valider le format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.paypalEmail)) {
      alert("Format d'email invalide");
      return;
    }

    this.isProcessing = true;
    this.step = 'processing';

    // Récupérer l'ID utilisateur
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
      methodePaiement: 'paypal',
      emailPaypal: this.paypalEmail,
    };

    // Simuler la redirection vers PayPal puis le retour
    setTimeout(() => {
      this.step = 'redirecting';

      // Simuler le processus de paiement PayPal
      setTimeout(() => {
        this.processReservation(reservationPayload);
      }, 2000);
    }, 1500);
  }

  /** Traiter la réservation après validation PayPal */
  private processReservation(payload: any): void {
    this.reservationService.createReservation(payload).subscribe({
      next: (response) => {
        console.log('✅ Réservation créée avec succès:', response);

        // Nettoyer le sessionStorage
        sessionStorage.removeItem('reservationData');
        sessionStorage.removeItem('reservationComplete');
        sessionStorage.removeItem('reservationIncomplete');
        sessionStorage.removeItem('paymentMethod');

        // Rediriger vers la page de succès
        this.router.navigate(['/reservation/success'], {
          queryParams: { reservationId: response.id },
        });
      },
      error: (err) => {
        console.error('❌ Erreur lors de la création de la réservation:', err);
        this.isProcessing = false;
        this.step = 'email';
        alert('Erreur lors du paiement PayPal. Veuillez réessayer.');
      },
    });
  }

  /** Extraire l'ID utilisateur du token */
  private getUserIdFromToken(token: string | null): number | null {
    if (!token) return null;

    try {
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

  /** Mettre à jour l'email PayPal */
  updateEmail(event: any): void {
    this.paypalEmail = event.target.value;
  }

  /** Obtenir les sièges formatés */
  get selectedSeatsDisplay(): string {
    return this.selectedSeats
      .map((s) => `${s.rangee}${s.numero_siege}`)
      .join(', ');
  }
}
