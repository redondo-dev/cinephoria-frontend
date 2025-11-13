import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface Seance {
  id: string;
  date_seance: string;
  dateHeureDebut: string;
  dateHeureFin: string;
  qualite: 'Standard' | '3D' | 'IMAX' | 'VIP';
  prix: number;
  places_disponibles: number;
  salle?: string;
}

interface SeancesByDate {
  date: string;
  displayDate: string;
  seances: Seance[];
}

@Component({
  selector: 'app-seances-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seances-list.component.html',
  styleUrls: ['./seances-list.component.scss'],
})
export class SeancesListComponent implements OnInit {
  @Input() filmId!: number | string;
  @Input() seances: Seance[] = [];

  seancesByDate: SeancesByDate[] = [];
  selectedSeance: Seance | null = null;

  // Prix par qualité (peut être configuré via @Input si nécessaire)
  priceInfo = {
    Standard: 9.5,
    '3D': 12.5,
    IMAX: 15.0,
    VIP: 18.0,
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.groupSeancesByDate();
  }

  /**
   * Grouper les séances par date
   */
  private groupSeancesByDate(): void {
    const grouped = new Map<string, Seance[]>();

    this.seances.forEach((seance) => {
      const date = seance.date_seance;
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(seance);
    });

    this.seancesByDate = Array.from(grouped.entries())
      .map(([date, seances]) => ({
        date,
        displayDate: this.formatDate(date),
        seances: seances.sort((a, b) =>
          a.dateHeureDebut.localeCompare(b.dateHeureDebut)
        ),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Formater la date pour affichage
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Normaliser les dates pour comparaison
    const normalizeDate = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const normalizedDate = normalizeDate(date);
    const normalizedToday = normalizeDate(today);
    const normalizedTomorrow = normalizeDate(tomorrow);

    if (normalizedDate.getTime() === normalizedToday.getTime()) {
      return "Aujourd'hui";
    } else if (normalizedDate.getTime() === normalizedTomorrow.getTime()) {
      return 'Demain';
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    }
  }

  /**
   * Formater l'heure
   */
  formatTime(time: string): string {
    const date = new Date(time);
    return date.toTimeString().substring(0, 5);
  }
  /**
   * Obtenir la classe CSS pour la qualité
   */
  getQualityClass(qualite: string): string {
    switch (qualite) {
      case '3D':
        return 'quality-3d';
      case 'IMAX':
        return 'quality-imax';
      case 'VIP':
        return 'quality-vip';
      default:
        return 'quality-standard';
    }
  }

  /**
   * Obtenir l'icône pour la qualité
   */
  getQualityIcon(qualite: string): string {
    switch (qualite) {
      case '3D':
        return '🕶️';
      case 'IMAX':
        return '🎬';
      case 'VIP':
        return '👑';
      default:
        return '🎥';
    }
  }

  /**
   * Sélectionner une séance
   */
  selectSeance(seance: Seance): void {
    this.selectedSeance = seance;
  }

  /**
   * Réserver une séance
   */
  bookSeance(seance: Seance): void {
    if (seance.places_disponibles <= 0) {
      return;
    }
    // Redirection vers la page de réservation avec l'ID de la séance
    this.router.navigate(['/reservation/sieges', seance.id]);
  }

  /**
   * Vérifier si une séance est disponible
   */
  isSeanceAvailable(seance: Seance): boolean {
    return seance.places_disponibles > 0;
  }

  /**
   * Obtenir le texte de disponibilité
   */
  getAvailabilityText(seance: Seance): string {
    if (seance.places_disponibles <= 0) {
      return 'Complet';
    } else if (seance.places_disponibles < 10) {
      return `${seance.places_disponibles} places restantes`;
    } else {
      return 'Disponible';
    }
  }

  /**
   * Obtenir la classe de disponibilité
   */
  getAvailabilityClass(seance: Seance): string {
    if (seance.places_disponibles <= 0) {
      return 'unavailable';
    } else if (seance.places_disponibles < 10) {
      return 'low-availability';
    } else {
      return 'available';
    }
  }
}
