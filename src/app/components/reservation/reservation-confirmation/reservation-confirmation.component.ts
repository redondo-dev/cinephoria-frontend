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
    } else {
      console.error('Aucune donnée de réservation');
      this.router.navigate(['/reservation']);
    }
  }

  get isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  get selectedSeatsDisplay(): string {
    return this.selectedSeats
      .map((s) => `${s.rangee}${s.numero_siege}`)
      .join(', ');
  }


  get seanceDateDisplay(): string {
    const seance = this.reservationData?.seance;
    if (!seance?.dateHeureDebut) return 'Non spécifiée';
    const dateObj = new Date(seance.dateHeureDebut);
    return dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  get seanceHeureDisplay(): string {
    const seance = this.reservationData?.seance;
    if (!seance?.dateHeureDebut) return '';
    const dateObj = new Date(seance.dateHeureDebut);
    return dateObj.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get salleDisplay(): string {
    const salle = this.reservationData?.seance?.salle;
    return salle?.nom_salle || salle?.nom || 'Non spécifiée';
  }

  validateReservation() {
    if (!this.isAuthenticated) {
      alert('Veuillez vous connecter ou créer un compte avant de valider.');
      this.router.navigate(['/auth/login']);
      return;
    }

    sessionStorage.removeItem('reservationData');
    sessionStorage.removeItem('reservationComplete');

    this.router.navigate(['/']);
  }

  goBack() {
    this.router.navigate([
      '/reservation/sieges',
      this.reservationData.seance?.id || this.reservationData.seanceId,
    ]);
  }

  goToLogin(): void {
    if (!this.reservationData) {
      this.reservationData = {
        seance: { id: this.reservationData?.seanceId },
        sieges: this.selectedSeats || [],
        total: this.totalPrice || 0,
      };
    }
    sessionStorage.setItem(
      'reservationIncomplete',
      JSON.stringify(this.reservationData),
    );
    sessionStorage.setItem('redirectAfterLogin', '/reservation/payment');
    this.router.navigate(['/auth/login']);
  }

  goToRegister(): void {
    sessionStorage.setItem(
      'reservationIncomplete',
      JSON.stringify(this.reservationData),
    );
    sessionStorage.setItem('redirectAfterLogin', '/reservation/payment');
    this.router.navigate(['/auth/register']);
  }

  continueToPayment(): void {
    this.router.navigate(['/reservation/payment']);
  }
}
