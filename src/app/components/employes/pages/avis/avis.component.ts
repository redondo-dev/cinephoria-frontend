import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvisService, Avis } from '../../services/employes.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-avis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avis.component.html',
  styleUrls: ['./avis.component.scss'],
})
export class AvisComponent implements OnInit {
  avis: Avis[] = [];
  viewMode: 'all' | 'pending' = 'pending';

  // Rejet avec motif — au-delà du strict minimum de l'énoncé (US9 : "Supprimer/valider
  // les avis"), qui n'exige qu'une validation ou une suppression. Utile pour distinguer
  // un avis refusé avec justification d'un avis simplement supprimé.
  showRejectModal = false;
  avisToReject: Avis | null = null;
  rejectMotif = '';
  rejecting = false;

  constructor(private avisService: AvisService, private toast: ToastrService) {}

  ngOnInit(): void {
    this.showPending();
  }

  showAll(): void {
    this.viewMode = 'all';
    this.avisService.getAll().subscribe({
      next: (avis) => (this.avis = this.mapAvis(avis)),
      error: (err) => console.error('Erreur chargement avis', err),
    });
  }

  showPending(): void {
    this.viewMode = 'pending';
    this.avisService.getPending().subscribe({
      next: (avis) => (this.avis = this.mapAvis(avis)),
      error: (err) => console.error('Erreur chargement avis en attente', err),
    });
  }

  private mapAvis(avisList: any[]): Avis[] {
    return avisList.map((a) => ({
      ...a,
      filmTitre: a.filmTitre || a.film?.titre || 'Film inconnu',
      userEmail: a.userEmail || a.utilisateur?.email || 'Utilisateur inconnu',
    }));
  }

  private refresh(): void {
    this.viewMode === 'all' ? this.showAll() : this.showPending();
  }

  validateAvis(id: number): void {
    this.avisService.validate(id).subscribe({
      next: () => {
        this.toast.success('Avis validé avec succès');
        this.refresh();
      },
      error: (err) => {
        this.toast.error(err.message || "Erreur lors de la validation de l'avis");
        console.error('Erreur validation', err);
      },
    });
  }

  // ── Rejet avec motif ──
  openRejectModal(avisItem: Avis): void {
    this.avisToReject = avisItem;
    this.rejectMotif = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.avisToReject = null;
    this.rejectMotif = '';
  }

  confirmReject(): void {
    if (!this.avisToReject?.id || !this.rejectMotif.trim()) return;

    this.rejecting = true;
    this.avisService.reject(this.avisToReject.id, this.rejectMotif.trim()).subscribe({
      next: () => {
        this.toast.success('Avis rejeté');
        this.rejecting = false;
        this.closeRejectModal();
        this.refresh();
      },
      error: (err) => {
        this.toast.error(err.message || "Erreur lors du rejet de l'avis");
        this.rejecting = false;
        console.error('Erreur rejet', err);
      },
    });
  }

  deleteAvis(id: number): void {
    if (confirm('Confirmer la suppression de cet avis ?')) {
      this.avisService.delete(id).subscribe({
        next: () => {
          this.toast.success('Avis supprimé avec succès');
          this.refresh();
        },
        error: (err) => {
          this.toast.error(err.message || "Erreur lors de la suppression de l'avis");
          console.error('Erreur suppression', err);
        },
      });
    }
  }
}
