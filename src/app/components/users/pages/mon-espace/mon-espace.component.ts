// mon-espace.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommandesComponent } from '../commande/commande.component';
import { AvisService } from '../../../../core/services/avis.service';
import { Avis } from '../../../../core/models/commande.model';


@Component({
  selector: 'app-mon-espace',
  standalone: true,
  imports: [CommonModule, CommandesComponent],
  templateUrl: './mon-espace.component.html',
  styleUrls: ['./mon-espace.component.scss'],
})
export class MonEspaceComponent implements OnInit {
  private avisService = inject(AvisService);

  hasAvis: boolean = false;
  loadingAvis: boolean = false;
  mesAvis: Avis[] = [];
  ngOnInit() {
    this.chargerAvis();
  }

  chargerAvis() {
    this.loadingAvis = true;

    // Si vous avez une méthode pour récupérer les avis
    this.avisService.getMesAvis().subscribe({
      next: (response) => {
        console.log('✅ Avis reçus:', response);
        this.mesAvis = response.avis || [];
        this.hasAvis = this.mesAvis.length > 0;
        this.loadingAvis = false;
      },
      error: (error) => {
        console.error('Erreur chargement avis:', error);
        this.loadingAvis = false;
        this.hasAvis = false;
      },
    });
  }


  generateStars(note: number): string {
    const fullStars = '★'.repeat(Math.floor(note));
    const emptyStars = '☆'.repeat(5 - Math.floor(note));
    return fullStars + emptyStars;
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'en_attente': 'En attente de modération',
      'approuve': 'Approuvé',
      'rejete': 'Rejeté'
    };
    return labels[statut] || statut;
  }
}
