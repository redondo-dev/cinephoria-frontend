import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservation-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-confirmation.component.html',
  styleUrls: ['./reservation-confirmation.component.scss'],
})
export class ReservationConfirmationComponent {
  reservationData: any;
  selectedSeats: any[] = [];
  totalPrice = 0;

  constructor(private router: Router) {
    const data = sessionStorage.getItem('reservationComplete');
    if (data) {
      const parsed = JSON.parse(data);
      this.reservationData = parsed;
      this.selectedSeats = parsed.sieges || [];
      this.totalPrice = parsed.total || 0;
      console.log('Sièges sélectionnés:', this.selectedSeats);
    } else {
      console.error(' Aucune donnée de réservation');
      this.router.navigate(['/reservation']);
    }
  }

  /** Simule un test d'authentification */
  get isAuthenticated(): boolean {
    return !!localStorage.getItem('userToken');
  }

  get selectedSeatsDisplay(): string {
    return this.selectedSeats
      .map((s) => `${s.rangee}${s.numero_siege}`)
      .join(', ');
  }
  get seanceDisplay(): string {
    const seance = this.reservationData?.seance;
    if (!seance) return 'Non spécifiée';

    // Essayer différents formats
    const horaire = seance.horaire || seance.dateHeureDebut;
    const date = seance.date_seance || seance.date;
    const salle = seance.salle?.nom || seance.salle?.nom_salle;

    let display = '';

    if (date) {
      const dateObj = new Date(date);
      display += dateObj.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    }

    if (horaire) {
      if (display) display += ' à ';
      if (horaire instanceof Date) {
        display += horaire.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });
      } else {
        display += horaire;
      }
    }

    if (salle) {
      if (display) display += ' - ';
      display += salle;
    }

    return display || 'Non spécifiée';
  }

  /** Valider la réservation */
  validateReservation() {
    if (!this.isAuthenticated) {
      alert('Veuillez vous connecter ou créer un compte avant de valider.');
      this.router.navigate(['/auth/login']);
      return;
    }

    console.log('Validation de la réservation:', {
      seance_id: this.reservationData.seance?.id,
      sieges: this.selectedSeats.map((s) => s.id),
      total: this.totalPrice,
    });
    alert(' Réservation confirmée avec succès !');
    // Nettoyer le sessionStorage
    sessionStorage.removeItem('reservationData');
    sessionStorage.removeItem('reservationComplete');

    this.router.navigate(['/']); // retour à l’accueil
  }

  /** Retour à la sélection */
  goBack() {
    this.router.navigate([
      '/reservation/seats',
      this.reservationData.seance?.id || this.reservationData.seanceId,
    ]);
  }

  goToLogin(): void {
    // Sauvegarder l'URL de retour
    if (!this.reservationData) {
      console.error('reservationData manquant !');

      this.reservationData = {
        seance: { id: this.reservationData?.seanceId },
        sieges: this.selectedSeats || [],
        total: this.totalPrice || 0,
      };
    }
    sessionStorage.setItem(
      'reservationIncomplete',
      JSON.stringify(this.reservationData)
    );
    sessionStorage.setItem('redirectAfterLogin', '/reservation/payment');
    this.router.navigate(['/auth/login']);
  }

  goToRegister(): void {
    sessionStorage.setItem(
      'reservationIncomplete',
      JSON.stringify(this.reservationData)
    );
    sessionStorage.setItem('redirectAfterLogin', '/reservation/payment');
    this.router.navigate(['/auth/register']);
  }

  continueToPayment(): void {
    this.router.navigate(['/reservation/payment']);
  }
}
