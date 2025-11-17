// src/app/utilisateur/commandes/commandes.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../../core/services/users.service';
import { Commande, Film } from '../../../../core/models/commande.model';
import { AvisFormComponent } from '../avis-form/avis-form.component';

@Component({
  selector: 'app-commande',
  standalone: true,
  imports: [CommonModule, AvisFormComponent],
  templateUrl: './commande.component.html',
  styleUrls: ['./commande.component.scss'],
})
export class CommandesComponent implements OnInit {
  private usersService = inject(UsersService);

  commandes = signal<Commande[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  filmSelectionne = signal<Film | null>(null);

  ngOnInit(): void {
    this.chargerCommandes();
  }

  chargerCommandes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.usersService.getMesCommandes().subscribe({
      next: (commandes) => {
        this.commandes.set(commandes);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des commandes');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  isSeancePassee(dateSeance: Date): boolean {
    return new Date(dateSeance) < new Date();
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      EN_ATTENTE: 'En attente',
      CONFIRMEE: 'Confirmée',
      ANNULEE: 'Annulée',
    };
    return labels[statut] || statut;
  }

  ouvrirFormulaireAvis(film: Film): void {
    this.filmSelectionne.set(film);
  }

  fermerFormulaireAvis(): void {
    this.filmSelectionne.set(null);
  }

  onAvisEnvoye(): void {
    this.fermerFormulaireAvis();
    // Optionnel : afficher un message de succès
  }
}
