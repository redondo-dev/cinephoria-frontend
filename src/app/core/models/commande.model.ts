// src/app/models/commande.model.ts
export interface Commande {
  id: number;
  numero: string;
  dateCommande: Date;
  montantTotal: number;
  statut: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE';
  billets: Billet[];
}

export interface Billet {
  id: number;
  numeroSiege: string;
  prix: number;
  seance: Seance;
}

export interface Seance {
  id: number;
  dateHeure: Date;
  salle: string;
  film: Film;
}

export interface Film {
  id: number;
  titre: string;
  affiche: string;
  noteAverage?: number;
  peutEtreNote?: boolean; // Calculé côté front si séance passée
}

export interface Avis {
  id?: number;
  filmId: number;
  note: number;
  description: string;
  dateCreation?: Date;
  statut?: 'EN_ATTENTE' | 'VALIDE' | 'REJETE';
}
