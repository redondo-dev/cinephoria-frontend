import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from './../../../core/services/reservation.service';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
})
export class ReservationSuccessComponent implements OnInit {
  reservationId: number | null = null;
  reservationDetails: any = null;
  isLoading = true;
  error = false;
  qrCodeUrl: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reservationService: ReservationService,
  ) {}

  ngOnInit(): void {
    // ✅ Corrigé — paramMap au lieu de queryParams
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.reservationId = +id;
        this.qrCodeUrl = this.generateQrCodeUrl(this.reservationId);
        this.loadReservationDetails(this.reservationId);
      } else {
        this.isLoading = false;
        this.showDefaultSuccess();
      }
    });
  }

  private loadReservationDetails(id: number): void {
    this.reservationService.getReservationById(id).subscribe({
      next: (data) => {
        this.reservationDetails = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement réservation:', err);
        this.isLoading = false;
        this.error = true;
      },
    });
  }

  private showDefaultSuccess(): void {
    this.reservationDetails = {
      id: 'N/A',
      statut: 'confirmée',
      dateReservation: new Date(),
    };
  }

  private generateQrCodeUrl(id: number): string {
    return `https://api.qrserver.com/v1/create-qr-code/?data=reservation-${id}&size=200x200`;
  }

  downloadTicket(): void {
    if (!this.reservationId) return;
    alert(`Téléchargement du billet #${this.reservationId} en cours...`);
  }

  sendByEmail(): void {
    if (!this.reservationId) return;
    alert('Un email de confirmation a été envoyé à votre adresse !');
  }

  // ✅ Corrigé — route correcte
  goToMyReservations(): void {
    this.router.navigate(['/mon-espace']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  bookAnother(): void {
    this.router.navigate(['/reservation']);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get formattedSeats(): string {
    const sieges = this.reservationDetails?.siegesReserves;
    if (!sieges?.length) return 'N/A';
    return sieges.map((s: any) => `${s.rangee}${s.numero_siege}`).join(', ');
  }

  get filmTitle(): string {
    return (
      this.reservationDetails?.seance?.film?.titre ||
      this.reservationDetails?.film?.titre ||
      'Film'
    );
  }

  get cinemaName(): string {
    return (
      this.reservationDetails?.seance?.salle?.cinema?.nom ||
      this.reservationDetails?.cinema?.nom ||
      'Cinéma'
    );
  }

  // ✅ Corrigé — dateHeureDebut au lieu de date_seance
  get showTime(): string {
    const seance = this.reservationDetails?.seance;
    if (!seance) return 'N/A';
    const date = seance.dateHeureDebut;
    return date ? this.formatDate(date) : 'N/A';
  }
}
