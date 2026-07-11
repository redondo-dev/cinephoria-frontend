// src/app/features/reservation/payment/stripe-payment/stripe-payment.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReservationService } from '../../../../core/services/reservation.service';
import { SiegeWithStatus } from '../../../../core/models/siege.model';
import { environment } from '../../../../../environments/environment';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-stripe-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stripe-payment.component.html',
  styleUrls: ['./stripe-payment.component.scss'],
})
export class StripePaymentComponent implements OnInit, OnDestroy {
  // Données réservation
  reservationData: any;
  selectedSeats: SiegeWithStatus[] = [];
  totalPrice = 0;

  // Stripe
  stripe: Stripe | null = null;
  cardElement: StripeCardElement | null = null;

  // États UI
  isProcessing = false;
  isStripeReady = false;
  errorMessage = '';
  cardError = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private reservationService: ReservationService,
  ) {}

  async ngOnInit(): Promise<void> {
    // 1. Récupérer les données de réservation depuis sessionStorage
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

    // 2. Initialiser Stripe
    await this.initStripe();
  }

  private async initStripe(): Promise<void> {
    try {
      this.stripe = await loadStripe(environment.stripePublicKey);

      if (!this.stripe) {
        this.errorMessage = 'Impossible de charger le module de paiement.';
        return;
      }

      const elements = this.stripe.elements({
        locale: 'fr',
      });

      // 3. Créer et monter l'élément carte
      this.cardElement = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#1a1a2e',
            fontFamily: '"DM Sans", sans-serif',
            '::placeholder': { color: '#a0a0b0' },
            iconColor: '#e50914',
          },
          invalid: {
            color: '#e50914',
            iconColor: '#e50914',
          },
        },
        hidePostalCode: true,
      });

      this.cardElement.mount('#stripe-card-element');

      // 4. Écouter les erreurs de saisie carte
      this.cardElement.on('change', (event) => {
        this.cardError = event.error ? event.error.message : '';
      });

      this.cardElement.on('ready', () => {
        this.isStripeReady = true;
      });
    } catch (err) {
      this.errorMessage = 'Erreur lors du chargement du paiement.';
      console.error(err);
    }
  }

  get selectedSeatsDisplay(): string {
    return this.selectedSeats.map((s) => `${s.rangee}${s.numero_siege}`).join(', ');
  }

  private getUserId(): number | null {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.id || null;
  }

  async submitPayment(): Promise<void> {
    if (!this.stripe || !this.cardElement || this.isProcessing) return;

    const userId = this.getUserId();
    if (!userId) {
      alert('Vous devez être connecté pour effectuer un paiement.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';

    try {
      // 5. Demander un PaymentIntent au backend
      const { clientSecret } = await this.http
        .post<{ clientSecret: string }>(
          `${environment.apiUrl}/api/payments/create-payment-intent`,
          {
            montant: this.totalPrice,
            reservationData: {
              seance_id: this.reservationData.seance?.id,
              utilisateur_id: userId,
            },
          },
        )
        .toPromise() as { clientSecret: string };

      // 6. Confirmer le paiement côté Stripe (carte jamais envoyée à votre serveur)
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: { card: this.cardElement },
        },
      );

      if (error) {
        this.errorMessage = error.message || 'Erreur lors du paiement.';
        this.isProcessing = false;
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // 7. Créer la réservation en base UNIQUEMENT si paiement OK
        this.reservationService
          .createReservation({
            utilisateur_id: userId,
            seance_id: this.reservationData.seance?.id,
            nb_places: this.selectedSeats.length,
            sieges: this.selectedSeats.map((s) => s.id),
            prix_unitaire: this.totalPrice / this.selectedSeats.length,
            stripe_payment_id: paymentIntent.id,
            statut_reservation: 'confirmee',
          })
          .subscribe({
            next: (res) => {
              // 8. Nettoyer le sessionStorage
              sessionStorage.removeItem('reservationData');
              sessionStorage.removeItem('reservationComplete');
              sessionStorage.removeItem('reservationIncomplete');

              // 9. Rediriger vers la page de succès
              this.router.navigate(['/reservation/success', res.id]);
            },
            error: () => {
              this.errorMessage =
                'Paiement effectué mais erreur lors de la réservation. Contactez le support.';
              this.isProcessing = false;
            },
          });
      }
    } catch (err: any) {
      this.errorMessage = err?.message || 'Erreur inattendue. Veuillez réessayer.';
      this.isProcessing = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/reservation/confirmation']);
  }

  ngOnDestroy(): void {
    this.cardElement?.destroy();
  }
}
