
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from './../../../core/services/reservation.service';





@Component({
  selector: 'app-success',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})



export class ReservationSuccessComponent implements OnInit {
  reservationId: number | null = null;
  reservationDetails: any = null;
  isLoading = true;
  error = false;
  qrCodeUrl: string = ''; // ✅ Nouveau : URL du QR code

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID de réservation depuis l'URL
    this.route.queryParams.subscribe((params) => {
      const id = params['reservationId'];

      if (id) {
        this.reservationId = +id;
        this.qrCodeUrl = this.generateQrCodeUrl(this.reservationId); // ✅ QR code généré
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
        console.log('Détails de la réservation:', data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la réservation:', err);
        this.isLoading = false;
        this.error = true;
      },
    });
  }

  /** Afficher le succès par défaut si pas de détails */
  private showDefaultSuccess(): void {
    this.reservationDetails = {
      id: 'N/A',
      statut: 'confirmée',
      dateReservation: new Date(),
    };
  }

  /** ✅ Génération du QR code */
  private generateQrCodeUrl(id: number): string {
    // Utilisation du service public QRServer
   return `https://api.qrserver.com/v1/create-qr-code/?data=reservation-${id}&size=200x200`;
  }

  /** Télécharger le billet (simulation) */
  downloadTicket(): void {
    if (!this.reservationId) {
      alert('Impossible de télécharger le billet');
      return;
    }

    console.log('Téléchargement du billet pour la réservation:', this.reservationId);
    alert(`Téléchargement du billet #${this.reservationId} en cours...`);
  }

  /** Envoyer par email (simulation) */
  sendByEmail(): void {
    if (!this.reservationId) {
      alert("Impossible d'envoyer l'email");
      return;
    }

    console.log('Envoi du billet par email pour la réservation:', this.reservationId);
    alert('Un email de confirmation a été envoyé à votre adresse !');
  }

  goToMyReservations(): void {
    this.router.navigate(['/profile/reservations']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  bookAnother(): void {
    this.router.navigate(['/reservation']);
  }

  /** Formatter la date */
  formatDate(date: string | Date): string {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /** Obtenir les sièges formatés */
  get formattedSeats(): string {
    if (!this.reservationDetails?.sieges) return 'N/A';
    return this.reservationDetails.sieges
      .map((s: any) => `${s.rangee}${s.numero_siege}`)
      .join(', ');
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

  get showTime(): string {
    const seance = this.reservationDetails?.seance;
    if (!seance) return 'N/A';

    const date = seance.date_seance || seance.date;
    if (date) return this.formatDate(date);
    return 'N/A';
  }
}
