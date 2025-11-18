// commande.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../../core/services/users.service';
import { Commande, Film } from '../../../../core/models/commande.model';
import { AvisFormComponent } from '../avis-form/avis-form.component';
@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [CommonModule, AvisFormComponent],
  templateUrl: './commande.component.html',
  styleUrls: ['./commande.component.scss'],
})
export class CommandesComponent implements OnInit {
  // Injection du service
  private usersService = inject(UsersService);

  // Propriétés
  commandes: Commande[] = [];
  loading: boolean = false;
  error: string = '';
  filmSelectionne: Film | null = null;

  ngOnInit() {
    this.chargerCommandes();
  }

  chargerCommandes() {
    console.log('🔄 Début chargement commandes...');
    this.loading = true;
    this.error = '';

    this.usersService.getMesCommandes().subscribe({
      next: (commandes: Commande[]) => {
        console.log('✅ Réponse reçue:', commandes);
        this.commandes =commandes;
        console.log('📋 Commandes assignées:', this.commandes.length);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur getMesCommandes:', error);
        this.error = 'Erreur lors du chargement des réservations';
        this.loading = false;
      },
    });
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      confirmee: 'Confirmée',
      en_attente: 'En attente',
      annulee: 'Annulée',
    };
    return labels[statut] || statut;
  }

  getBilletStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      valide: 'Valide',
      utilise: 'Utilisé',
      annule: 'Annulé',
    };
    return labels[statut] || statut;
  }

  calculateTotal(commande: any): number {
    return commande.nb_places * parseFloat(commande.prix_unitaire);
  }

  isSeancePassee(dateSeance: string | Date | undefined): boolean {
    if (!dateSeance) return false;
    const date =
      typeof dateSeance === 'string' ? new Date(dateSeance) : dateSeance;
    return date < new Date();
  }

  ouvrirFormulaireAvis(film: Film) {
    this.filmSelectionne = film;
  }

  fermerFormulaireAvis() {
    this.filmSelectionne = null;
  }

  onAvisEnvoye() {
    console.log('✅ Avis envoyé avec succès');
    this.fermerFormulaireAvis();
    // Optionnel : recharger les commandes
    this.chargerCommandes();
  }
}
