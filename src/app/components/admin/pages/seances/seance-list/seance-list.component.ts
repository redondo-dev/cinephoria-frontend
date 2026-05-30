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
  capacite?: number;
  heureFin: string;
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
  seanceToDelete: ApiSeance | null = null;
  showDeleteModal = false;
  currentPage = 1;
  totalPages = 1;
  total = 0;
  readonly limit = 20;

  ngOnInit() {
    console.time('⏱️ Chargement total');
    this.loadSeances();
  }

  loadSeances() {
    this.loading = true;
    this.error = null;

    const startTime = performance.now();

    this.adminService
      .getSeances(this.currentPage, this.limit)
      .pipe(
        catchError((err) => {
          console.error('❌ Erreur chargement:', err);
          this.error = 'Erreur lors du chargement des séances';
          return of({ data: [], total: 0, totalPages: 1 });
        }),
      )
      .subscribe({
        next: (response: any) => {

          this.seances = response.data || [];
          this.total = response.total || 0;
          this.totalPages = response.totalPages || 1;
          this.loading = false;
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadSeances();
  }
  
  openDeleteModal(seance: ApiSeance): void {
    this.seanceToDelete = seance;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.seanceToDelete) return;

    this.adminService.deleteSeance(this.seanceToDelete.id).subscribe({
      next: () => {
        this.seances = this.seances.filter(
          (s) => s.id !== this.seanceToDelete!.id,
        );
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error(err);
        this.closeDeleteModal();
      },
    });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.seanceToDelete = null;
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
    return (seance.capacite || 0) < 20;
  }
}
