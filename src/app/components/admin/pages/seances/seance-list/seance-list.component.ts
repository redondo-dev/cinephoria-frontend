// // src/app/admin/pages/seances/seances-list/seances-list.component.ts
// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterLink } from '@angular/router';
// import {
//   AdminService,
//   Film,
//   Salle,
// } from '../../../services/admin.service';
// import { firstValueFrom } from 'rxjs';

// // Définir les interfaces qui correspondent exactement à l'API
// interface ApiSeance {
//   id: number;
//   film: string;
//   salle: string;
//   dateSeance: string;
//   heureDebut: string;
//   heureFin: string;
//   prixMoyen: number;
//   placesDisponibles: number;
//   film_id?: number;
//   salle_id?: number;
//   reservations?: any[];
// }

// interface ApiResponse {
//   data: ApiSeance[];
// }

// interface SeanceWithDetails extends ApiSeance {
//   filmTitre: string;
//   salleNom: string;
// }

// @Component({
//   selector: 'app-seance-list',
//   imports: [CommonModule, RouterLink],
//   standalone: true,
//   templateUrl: './seance-list.component.html',
//   styleUrls: ['./seance-list.component.scss'],
// })
// export class SeanceListComponent implements OnInit {
//   private adminService = inject(AdminService);

//   seances: SeanceWithDetails[] = [];
//   films: Film[] = [];
//   salles: Salle[] = [];
//   loading = true;
//   error: string | null = null;

//   ngOnInit() {
//     this.loadData();
//   }

//   async loadData() {
//     this.loading = true;

//     try {
//       const [filmsRes, sallesRes, seancesRes] = await Promise.all([
//         firstValueFrom(this.adminService.getFilms()),
//         firstValueFrom(this.adminService.getSalles()),
//         firstValueFrom(this.adminService.getSeances()),
//       ]);
// // AJOUT DES LOGS POUR DEBUGGER
//     console.log('Structure de seancesRes:', seancesRes);
//     console.log('Type de seancesRes:', typeof seancesRes);
//     console.log('Est-ce un array?', Array.isArray(seancesRes));
//       this.films = Array.isArray(filmsRes) ? filmsRes : [];
//       this.salles = Array.isArray(sallesRes) ? sallesRes : [];

//       // CORRECTION : Utiliser ApiResponse au lieu de any
//      const seancesArray = (seancesRes as any)?.data || seancesRes || [];


//       // Enrichir les séances avec les noms de films et salles
//       this.seances = seancesArray.map((seance: ApiSeance) => ({
//         ...seance,
//         filmTitre: seance.film || 'Inconnu',
//         salleNom: seance.salle || 'Inconnue',
//       }));

//       this.loading = false;
//     } catch (err) {
//       console.error('Erreur lors du chargement des données :', err);
//       this.error = 'Erreur lors du chargement des données';
//       this.loading = false;
//     }
//   }

//   deleteSeance(seance: SeanceWithDetails) {
//     if (!confirm(`Êtes-vous sûr de vouloir supprimer cette séance ?`)) {
//       return;
//     }

//     if (seance.id) {
//       this.adminService.deleteSeance(seance.id).subscribe({
//         next: () => {
//           this.seances = this.seances.filter((s) => s.id !== seance.id);
//         },
//         error: (err) => {
//           alert('Erreur lors de la suppression de la séance');
//           console.error(err);
//         },
//       });
//     }
//   }

//   formatDate(dateStr: string): string {
//     if (!dateStr) return 'Date invalide';
//     try {
//       const date = new Date(dateStr);
//       return date.toLocaleDateString('fr-FR', {
//         weekday: 'long',
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//       });
//     } catch {
//       return 'Date invalide';
//     }
//   }

//   formatTime(dateStr: string): string {
//     if (!dateStr) return 'Heure invalide';
//     try {
//       const date = new Date(dateStr);
//       return date.toLocaleTimeString('fr-FR', {
//         hour: '2-digit',
//         minute: '2-digit',
//       });
//     } catch {
//       return 'Heure invalide';
//     }
//   }

//   isLowAvailability(seance: SeanceWithDetails): boolean {
//     return (seance.placesDisponibles || 0) < 20;
//   }
// }
// ============================================
// FRONTEND: seances-list.component.ts (Angular)
// ============================================
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { catchError, map, of } from 'rxjs';

interface ApiSeance {
  id: number;
  film: string;
  salle: string;
  dateSeance: string;
  heureDebut: string;
  heureFin: string;
  prixMoyen: number;
  placesDisponibles: number;
  film_id?: number;
  salle_id?: number;
}

@Component({
  selector: 'app-seance-list',
  imports: [CommonModule, RouterLink],
  standalone: true,
  templateUrl: './seance-list.component.html',
  styleUrls: ['./seance-list.component.scss'],
})
export class SeanceListComponent implements OnInit {
  private adminService = inject(AdminService);

  seances: ApiSeance[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit() {
    console.time('⏱️ Chargement total');
    this.loadSeances();
  }

  loadSeances() {
    this.loading = true;
    this.error = null;

    const startTime = performance.now();

    this.adminService.getSeances().pipe(
      map((response: any) => {
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
      }),
      catchError(err => {
        console.error('❌ Erreur chargement:', err);
        this.error = 'Erreur lors du chargement des séances';
        return of([]);
      })
    ).subscribe({
      next: (seances) => {
        const endTime = performance.now();
        console.log(`📊 ${seances.length} séances chargées en ${(endTime - startTime).toFixed(0)}ms`);
        console.timeEnd('⏱️ Chargement total');

        this.seances = seances;
        this.loading = false;
      }
    });
  }

  deleteSeance(seance: ApiSeance) {
    if (!confirm(`Supprimer la séance "${seance.film}" ?`)) return;

    this.adminService.deleteSeance(seance.id).subscribe({
      next: () => {
        this.seances = this.seances.filter((s) => s.id !== seance.id);
      },
      error: (err) => {
        alert('Erreur lors de la suppression');
        console.error(err);
      },
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'Date invalide';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Date invalide';
    }
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '--:--';

    // Si format HH:MM:SS
    if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return timeStr.substring(0, 5);
    }

    try {
      return new Date(timeStr).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '--:--';
    }
  }

  isLowAvailability(seance: ApiSeance): boolean {
    return (seance.placesDisponibles || 0) < 20;
  }
}
