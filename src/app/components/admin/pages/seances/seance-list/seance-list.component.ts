// ============================================
// FRONTEND: seances-list.component.ts (Angular)
// ============================================
import { Component, OnInit, inject } from '@angular/core';

import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, of } from 'rxjs';

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
  imports: [RouterLink],
  standalone: true,
  templateUrl: './seance-list.component.html',
  styleUrls: ['./seance-list.component.scss'],
})
export class SeanceListComponent implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastrService);

  seances: ApiSeance[] = [];
  loading = true;
  error: string | null = null;
  seanceToDelete: ApiSeance | null = null;
  showDeleteModal = false;
  currentPage = 1;
  totalPages = 1;
  total = 0;
  readonly limit = 20;

  // Filtre par film OU par salle — redirection depuis la liste des films/salles quand
  // leur suppression est bloquée par des séances liées. Un seul des deux est actif
  // à la fois (selon la page d'origine).
  filmId: number | null = null;
  filmTitreFiltre: string | null = null;
  salleId: number | null = null;
  salleNomFiltre: string | null = null;

  // Sélection multiple pour la suppression en lot.
  selectedIds = new Set<number>();
  bulkDeleting = false;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.filmId = params['filmId'] ? +params['filmId'] : null;
      this.salleId = params['salleId'] ? +params['salleId'] : null;
      this.currentPage = 1;
      this.selectedIds.clear();
      this.loadSeances();
    });
  }

  loadSeances() {
    this.loading = true;
    this.error = null;

    this.adminService
      .getSeances(
        this.currentPage,
        this.limit,
        this.filmId ?? undefined,
        this.salleId ?? undefined,
      )
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
          this.filmTitreFiltre = this.seances[0]?.film ?? this.filmTitreFiltre;
          this.salleNomFiltre = this.seances[0]?.salle ?? this.salleNomFiltre;
          this.selectedIds.clear();
          this.loading = false;
        },
      });
  }

  clearFilmFilter(): void {
    this.router.navigate(['/admin/seances']);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadSeances();
  }

  // ── Sélection multiple ────────────────────────────────
  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  toggleSelection(id: number): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  get allSelectedOnPage(): boolean {
    return (
      this.seances.length > 0 &&
      this.seances.every((s) => this.selectedIds.has(s.id))
    );
  }

  toggleSelectAll(): void {
    if (this.allSelectedOnPage) {
      this.seances.forEach((s) => this.selectedIds.delete(s.id));
    } else {
      this.seances.forEach((s) => this.selectedIds.add(s.id));
    }
  }

  bulkDelete(): void {
    const ids = Array.from(this.selectedIds);
    if (ids.length === 0) return;

    if (
      !confirm(
        `Supprimer les ${ids.length} séance(s) sélectionnée(s) ? Cette action est irréversible.`,
      )
    ) {
      return;
    }

    this.bulkDeleting = true;
    this.adminService.bulkDeleteSeances(ids).subscribe({
      next: (res: any) => {
        this.bulkDeleting = false;
        if (res.blockedCount > 0) {
          this.toast.warning(res.message);
        } else {
          this.toast.success(res.message);
        }
        this.loadSeances();
      },
      error: (err) => {
        this.bulkDeleting = false;
        this.toast.error(
          err.message || 'Erreur lors de la suppression groupée',
        );
        console.error('Erreur bulkDelete:', err);
      },
    });
  }

  // ── Une fois le film/la salle totalement vidé(e) de ses séances, proposer
  // de le/la supprimer directement depuis cette page. ──
  get canDeleteFilmNow(): boolean {
    return !!this.filmId && this.total === 0 && !this.loading;
  }

  get canDeleteSalleNow(): boolean {
    return !!this.salleId && this.total === 0 && !this.loading;
  }

  deleteFilmNow(): void {
    if (!this.filmId) return;
    if (
      !confirm(
        'Toutes les séances de ce film ont été supprimées. Confirmer la suppression du film ?',
      )
    ) {
      return;
    }
    this.adminService.deleteFilm(String(this.filmId)).subscribe({
      next: () => {
        this.toast.success('Film supprimé avec succès');
        this.router.navigate(['/admin/films']);
      },
      error: (err) => {
        this.toast.error(
          err.message || 'Erreur lors de la suppression du film',
        );
        console.error('Erreur suppression film:', err);
      },
    });
  }

  deleteSalleNow(): void {
    if (!this.salleId) return;
    if (
      !confirm(
        'Toutes les séances de cette salle ont été supprimées. Confirmer la suppression de la salle ?',
      )
    ) {
      return;
    }
    this.adminService.deleteSalle(String(this.salleId)).subscribe({
      next: () => {
        this.toast.success('Salle supprimée avec succès');
        this.router.navigate(['/admin/salles']);
      },
      error: (err) => {
        this.toast.error(
          err.message || 'Erreur lors de la suppression de la salle',
        );
        console.error('Erreur suppression salle:', err);
      },
    });
  }

  // ── Suppression unitaire (inchangé) ───────────────────
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
        this.total = Math.max(0, this.total - 1);
        this.closeDeleteModal();
      },
      error: (err) => {
        this.toast.error(
          err.message || 'Erreur lors de la suppression de la séance',
        );
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
