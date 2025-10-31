// frontend/src/app/components/reservation/payment/payment.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservationService } from '../../../core/services/reservation.service';
import { SiegeWithStatus } from '../../../core/models/siege.model';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent {
  reservationData!: {
    seance: any;
    cinema: any;
    film: any;
    total: number;
  };
  selectedSeats: SiegeWithStatus[] = [];
  totalPrice = 0;
  isProcessing = false;

  constructor(
    private router: Router,
    private reservationService: ReservationService
  ) {
    const data = sessionStorage.getItem('reservationComplete') ||sessionStorage.getItem('reservationIncomplete');;
    if (!data) {
       this.router.navigate(['/reservation']);
       } else {
      const parsed = JSON.parse(data);
      this.reservationData = parsed;
      this.selectedSeats = parsed.sieges || [];
      this.totalPrice = parsed.total || 0;
    }
  }

  /** 🔹 Retour au récapitulatif */
  goBack(): void {
    this.router.navigate(['/reservation/confirmation']);
  }

  /** 🔹 Affichage lisible des sièges sélectionnés */
  get selectedSeatsDisplay(): string {
    return this.selectedSeats
      .map((s) => `${s.rangee}${s.numero_siege}`)
      .join(', ');
  }

  /** 🔹 Création réelle de la réservation */
  confirmPayment(): void {
    if (!this.reservationData || !this.selectedSeats.length) {
      alert('Les informations de réservation sont incomplètes.');
      return;
    }

    const reservationPayload = {
      utilisateurId: 1,
      seanceId: this.reservationData.seance.id,
      sieges: this.selectedSeats.map((s) => s.id),
      total: this.totalPrice,
    };

    this.reservationService.createReservation(reservationPayload).subscribe({
      next: (response) => {
        console.log('Réservation créée ', response);
        sessionStorage.removeItem('reservationData');
        sessionStorage.removeItem('reservationComplete');
        this.router.navigate(['/reservation/success', response.id]);
      },
      error: (err) => {
        console.error('Erreur création réservation ', err);
        alert('Erreur lors de la création de la réservation');
      },
    });
  }

  /** 🔹 Paiement par carte */
  payWithCard(): void {
    console.log('💳 Paiement par carte en cours...');
    if (this.isProcessing) return;
     sessionStorage.setItem('paymentMethod', 'card');

    // Rediriger vers la page de paiement carte
    this.router.navigate(['/reservation/payment/card']);
  }


  /** Paiement via PayPal */

// Sauvegarde le mode de paiement choisi
 payWithPaypal(): void {
 if (this.isProcessing) return;
    sessionStorage.setItem('paymentMethod', 'paypal');

    // Rediriger vers la page de paiement PayPal
    this.router.navigate(['/reservation/payment/paypal']);
  }
}
