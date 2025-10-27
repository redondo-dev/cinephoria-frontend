// seat-selection.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../core/services/reservation.service';
import { SiegeWithStatus } from '../../core/models/siege.model';

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-selection.component.html',
  styleUrls: ['./seat-selection.component.scss'],
})
export class SeatSelectionComponent implements OnInit {
  seanceId!: number;
  reservationData: any;
  seats: SiegeWithStatus[][] = [];
  selectedSeats: SiegeWithStatus[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.seanceId = +this.route.snapshot.paramMap.get('seanceId')!;

    const data = sessionStorage.getItem('reservationData');
    if (data) {
      this.reservationData = JSON.parse(data);
      this.loadSeats();
    } else {
      this.router.navigate(['/reservation']);
    }
  }

  loadSeats(): void {
    this.loading = true;
    this.reservationService.getSiegesBySeance(this.seanceId).subscribe({
      next: (sieges) => {
        this.organizeSeatsInRows(sieges);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement sièges:', error);
        this.loading = false;
      },
    });
  }

  getSelectedSeatsDisplay(): string {
    return this.selectedSeats.map((s) => s.rangee + s.numero_siege).join(', ');
  }
  // Organiser les sièges par rangée
  organizeSeatsInRows(sieges: SiegeWithStatus[]): void {
    // Grouper par rangée
    const rowsMap = new Map<string, SiegeWithStatus[]>();

    sieges.forEach((siege) => {
      if (!rowsMap.has(siege.rangee)) {
        rowsMap.set(siege.rangee, []);
      }
      rowsMap.get(siege.rangee)!.push(siege);
    });

    // Trier les rangées (A, B, C...) et les sièges par numéro
    this.seats = Array.from(rowsMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, sieges]) =>
        sieges.sort((a, b) => a.numero_siege - b.numero_siege)
      );
  }

  toggleSeat(seat: SiegeWithStatus): void {
    if (!seat.isAvailable) return;

    if (seat.isSelected) {
      seat.isSelected = false;
      this.selectedSeats = this.selectedSeats.filter((s) => s.id !== seat.id);
    } else {
      if (this.selectedSeats.length < this.reservationData.nombrePersonnes) {
        seat.isSelected = true;
        this.selectedSeats.push(seat);
      }
    }
  }
  getTotalPrice(): number {
    return this.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }

  canConfirm(): boolean {
    return this.selectedSeats.length === this.reservationData.nombrePersonnes;
  }

  goBack(): void {
    this.router.navigate(['/reservation/selection']);
  }

  confirmSeats(): void {
    if (this.canConfirm()) {
      // Sauvegarder les sièges sélectionnés
      const reservationComplete = {
        ...this.reservationData,
        sieges: this.selectedSeats,
        total: this.getTotalPrice(),
      };

      sessionStorage.setItem(
        'reservationComplete',
        JSON.stringify(reservationComplete)
      );

      console.log('Sièges confirmés:', this.selectedSeats);
    }
  }
  // Méthode optionnelle pour créer la réservation directement
  private createReservation(): void {
    const reservationData = {
      seance_id: this.seanceId,
      nombre_personnes: this.reservationData.nombrePersonnes,
      siege_ids: this.selectedSeats.map((s) => s.id),
    };

    // Appel au service pour créer la réservation
    // this.reservationService.createReservation(reservationData).subscribe({
    //   next: (response) => {
    //     console.log('Réservation créée:', response);
    //     this.router.navigate(['/reservation/success', response.id]);
    //   },
    //   error: (error) => {
    //     console.error('Erreur création réservation:', error);
    //     // Afficher un message d'erreur
    //   }
    // });
  }
}
