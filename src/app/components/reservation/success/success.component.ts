
// success.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from './../../../core/services/reservation.service';
import jsPDF from 'jspdf';

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

  // États des actions
  isDownloading = false;
  isSendingEmail = false;
  emailSent = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reservationService: ReservationService,
  ) {}

  ngOnInit(): void {
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

  // ──────────────────────────────────────────────
  // 📄 TÉLÉCHARGEMENT DU BILLET EN PDF
  // ──────────────────────────────────────────────
  async downloadTicket(): Promise<void> {
    if (!this.reservationId || this.isDownloading) return;
    this.isDownloading = true;

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // ── Fond header ──
      doc.setFillColor(26, 26, 46);
      doc.rect(0, 0, 210, 45, 'F');

      // ── Titre ──
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('🎬 CINÉPHORIA', 15, 20);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 180, 210);
      doc.text('Billet de réservation', 15, 30);
      doc.text(`Réf. #${this.reservationId}`, 15, 38);

      // ── Encadré détails ──
      doc.setFillColor(247, 247, 251);
      doc.roundedRect(10, 55, 190, 90, 4, 4, 'F');

      doc.setTextColor(26, 26, 46);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Détails de votre réservation', 20, 68);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 100);

      const details = [
        ['Film',    this.filmTitle],
        ['Cinéma',  this.cinemaName],
        ['Séance',  this.showTime],
        ['Sièges',  this.formattedSeats],
        ['Places',  String(this.reservationDetails?.nb_places || 'N/A')],
        ['Statut',  'Confirmée ✓'],
      ];

      details.forEach(([label, value], i) => {
        const y = 80 + i * 10;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 100, 130);
        doc.text(label + ' :', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(26, 26, 46);
        doc.text(value, 65, y);
      });

      // ── QR Code ──
      try {
        const qrDataUrl = await this.loadImageAsBase64(this.qrCodeUrl);
        doc.addImage(qrDataUrl, 'PNG', 148, 55, 52, 52);
        doc.setFontSize(8);
        doc.setTextColor(130, 130, 150);
        doc.text('Présentez ce QR code', 152, 113);
        doc.text("à l'entrée du cinéma", 153, 118);
      } catch {
        console.warn('QR Code non chargé');
      }

      // ── Ligne de séparation ──
      doc.setDrawColor(220, 220, 235);
      doc.line(10, 152, 200, 152);

      // ── Prix total ──
      if (this.reservationDetails?.nb_places && this.reservationDetails?.prix_unitaire) {
        const total = (
          this.reservationDetails.nb_places * this.reservationDetails.prix_unitaire
        ).toFixed(2);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(99, 91, 255);
        doc.text(`Total payé : ${total} €`, 20, 165);
      }

      // ── Footer ──
      doc.setFillColor(26, 26, 46);
      doc.rect(0, 270, 210, 27, 'F');
      doc.setTextColor(150, 150, 180);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Ce billet est personnel et non remboursable.', 20, 280);
      doc.text('En cas de problème, contactez : support@cinephoria.fr', 20, 287);

      // ── Sauvegarde ──
      doc.save(`billet-cinephoria-${this.reservationId}.pdf`);
    } catch (err) {
      console.error('Erreur génération PDF:', err);
      alert('Erreur lors de la génération du billet.');
    } finally {
      this.isDownloading = false;
    }
  }

  // Charge une image distante en base64 pour jsPDF
  private loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  // ──────────────────────────────────────────────
  // 📧 ENVOI EMAIL (appel backend)
  // ──────────────────────────────────────────────
  sendByEmail(): void {
    if (!this.reservationId || this.isSendingEmail || this.emailSent) return;
    this.isSendingEmail = true;

    this.reservationService.sendConfirmationEmail(this.reservationId).subscribe({
      next: () => {
        this.emailSent = true;
        this.isSendingEmail = false;
      },
      error: (err) => {
        console.error('Erreur envoi email:', err);
        this.isSendingEmail = false;
        alert("Erreur lors de l'envoi de l'email.");
      },
    });
  }

  // ──────────────────────────────────────────────
  // 🧭 NAVIGATION
  // ──────────────────────────────────────────────
  goToMyReservations(): void {
    this.router.navigate(['/mon-espace']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  bookAnother(): void {
    this.router.navigate(['/reservation']);
  }

  // ──────────────────────────────────────────────
  // 🔧 UTILITAIRES
  // ──────────────────────────────────────────────
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

  get showTime(): string {
    const seance = this.reservationDetails?.seance;
    if (!seance) return 'N/A';
    const date = seance.dateHeureDebut;
    return date ? this.formatDate(date) : 'N/A';
  }
}
