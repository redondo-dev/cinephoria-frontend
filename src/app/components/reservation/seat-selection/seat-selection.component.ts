// seat-selection.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../../core/services/reservation.service';
import { SiegeWithStatus } from '../../../core/models/siege.model';

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
  error: string | null = null;

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
      console.log('📦 Données de réservation:', this.reservationData);
      this.loadSeats();
    } else {
      console.error(' Pas de données de réservation');
      this.router.navigate(['/reservation']);
    }
  }

  loadSeats(): void {
    this.loading = true;
    this.error = null;

    console.log(' Chargement des sièges pour séance:', this.seanceId);

    this.reservationService.getSiegesBySeance(this.seanceId).subscribe({
      next: (response: any) => {
        console.log(' Réponse API:', response);

        // L'API retourne { salle: {...}, sieges: [...] }
        let sieges: any[] = [];
        if (Array.isArray(response)) {
          sieges = response;
        } else if (response && Array.isArray(response.sieges)) {
          sieges = response.sieges;
        }

        if (!sieges || !Array.isArray(sieges)) {
          console.error(' Format de réponse invalide:', response);
          this.error = 'Format de données invalide';
          this.loading = false;
          return;
        }

        console.log(` ${sieges.length} sièges reçus`);

        // Mapper vers le format SiegeWithStatus
        const siegesWithStatus: SiegeWithStatus[] = sieges.map((siege) => ({
          id: siege.id,
          numero_siege: siege.numero,
          rangee: siege.rangee,
          type_siege:
            siege.type && typeof siege.type === 'string'
              ? siege.type.toLowerCase() === 'pmr'
                ? 'pmr'
                : siege.type.toLowerCase() === 'premium'
                ? 'premium'
                : 'classique'
              : 'classique',
          salle_id: siege.salle_id, // Ajout de la propriété requise
          isAvailable: siege.disponible,
          isSelected: false,
          price: 10.5, // Prix par défaut,
        }));

        this.organizeSeatsInRows(siegesWithStatus);
        this.loading = false;

        console.log(' Sièges organisés en rangées:', this.seats.length);
      },
      error: (error) => {
        console.error(' Erreur chargement sièges:', error);
        this.error = 'Impossible de charger les sièges. Veuillez réessayer.';
        this.loading = false;
      },
      complete: () => {
        console.log(' Chargement terminé');
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

      console.log(' Sièges confirmés:', this.selectedSeats);

      // Rediriger vers la page de paiement ou confirmation
      this.router.navigate(['/reservation/confirmation']);
    }
  }

  retryLoad(): void {
    this.loadSeats();
  }
}
