
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvisService, Avis } from '../../services/employes.service';

@Component({
  selector: 'app-avis',
  imports: [CommonModule],
  templateUrl: './avis.component.html',
  styleUrls: ['./avis.component.scss']
})

export class AvisComponent implements OnInit {
  avis: Avis[] = [];
  viewMode: 'all' | 'pending' = 'pending';

  constructor(private avisService: AvisService) {}

  ngOnInit(): void {
    this.showPending();
  }

  showAll(): void {
    this.viewMode = 'all';
    this.avisService.getAll().subscribe({
      next: (avis) => this.avis = avis,
      error: (err) => console.error('Erreur chargement avis', err)
    });
  }

  showPending(): void {
    this.viewMode = 'pending';
    this.avisService.getPending().subscribe({
      next: (avis) => this.avis = avis,
      error: (err) => console.error('Erreur chargement avis en attente', err)
    });
  }

  validateAvis(id: number): void {
    this.avisService.validate(id).subscribe({
      next: () => {
        if (this.viewMode === 'all') {
          this.showAll();
        } else {
          this.showPending();
        }
      },
      error: (err) => console.error('Erreur validation', err)
    });
  }

  deleteAvis(id: number): void {
    if (confirm('Confirmer la suppression de cet avis ?')) {
      this.avisService.delete(id).subscribe({
        next: () => {
          if (this.viewMode === 'all') {
            this.showAll();
          } else {
            this.showPending();
          }
        },
        error: (err) => console.error('Erreur suppression', err)
      });
    }
  }
}
