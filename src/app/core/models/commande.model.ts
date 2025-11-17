// src/app/core/models/commande.model.ts
export interface Commande {
  id: number;
  utilisateur_id: number;
  seance_id: number;
  nb_places: number;
  prix_unitaire: number;
  statut_reservation: 'en_attente' | 'confirmee' | 'annulee';
  date_creation: Date;
  seance?: Seance;
  billets?: Billet[];
}

export interface Billet {
  id: number;
  reservation_id: number;
  siege_id: number;
  statut_billet: 'valide' | 'utilise' | 'annule';
  tarif_id: number;
  qr_code: string;
  prix_final: number;
  date_utilisation_qr?: Date;
  date_expiration_qr?: Date;
  siege?: Siege;
  tarif?: Tarif;
}

export interface Seance {
  id: number;
  date_seance: Date;
  date_heure_debut: Date;
  date_heure_fin: Date;
  film_id: number;
  salle_id: number;
  film?: Film;
  salle?: Salle;
}

export interface Film {
  id: number;
  titre: string;
  affiche: string;
  noteAverage?: number; // Calculée dynamiquement
  date_derniere_seance?: Date; // Pour films-a-noter
}

export interface Avis {
  id?: number;
  utilisateur_id?: number;
  film_id: number;
  contenu: string; // ⚠️ Pas "description"
  note: number; // 1-5
  date_avis?: Date;
  statut_avis?: 'en_attente' | 'valide' | 'refuse';
  motif_refus?: string;
  date_validation?: Date;
  film?: Film; // Relation incluse dans les réponses backend
}

export interface Siege {
  id: number;
  numero_siege: string;
  salle_id: number;
}

export interface Salle {
  id: number;
  nom_salle: string;
}

export interface Tarif {
  id: number;
  nom_tarif: string;
  type_tarif: string;
  prix_unitaire: number;
}
