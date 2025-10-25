// core/models/reservation.model.ts

export type StatutReservation = 'en_attente' | 'confirmee' | 'annulee';

export type QualiteProjection =
  | 'Standard'
  | 'IMAX'
  | '2D'
  | '3D'
  | '4DX'
  | 'Dolby Atmos'
  | 'ScreenX';

// MODÈLES API

export interface Cinema {
  id: number;
  nom: string;
  ville: string;
  // Relations
  salles?: Salle[];
}

export interface Salle {
  id: number;
  nom_salle: string;
  capacite: number;
  cinema_id: number;
  qualite_projection: QualiteProjection;
  createdAt?: string; // timestamps: true
  updatedAt?: string; // timestamps: true
  // Relations
  cinema?: Cinema;
  sieges?: Siege[];
  seances?: Seance[];
}

export interface Seance {
  id: number;
  date_seance: string; // DATEONLY format YYYY-MM-DD
  film_id: number;
  salle_id: number;
  dateHeureDebut: string; // ISO datetime string
  dateHeureFin: string; // ISO datetime string
  qualite?: string;
  // Champs calculés ou ajoutés par le backend
  places_disponibles?: number;
  prix_base?: number;
  // Relations
  film?: Film;
  salle?: Salle;
  reservations?: Reservation[];
}

export interface Film {
  id: number;
  titre: string;
  duree: number; // en minutes
  affiche?: string;
  synopsis?: string;
  genre?: string;
  annee_sortie?: number;
  realisateur?: string;
  // Relations
  seances?: Seance[];
}

export interface Siege {
  id: number;
  salle_id: number;
  numero: number;
  rangee: string;
  est_pmr: boolean;
  est_reserve?: boolean;
  est_selectionne?: boolean;
  // Relations
  salle?: Salle;
}

export interface Reservation {
  id: number;
  utilisateur_id: number | null;
  seance_id: number;
  nb_places: number;
  prix_unitaire: number;
  prix_total: number; // Calculé par le backend
  statut_reservation: StatutReservation;
  date_creation: string; // ISO datetime string
  // Relations
  seance?: Seance;
  utilisateur?: Utilisateur;
  sieges?: ReservationSiege[];
}

// Table de liaison reservation <-> siege
export interface ReservationSiege {
  id: number;
  reservation_id: number;
  siege_id: number;
  // Relations
  reservation?: Reservation;
  siege?: Siege;
}

export interface Utilisateur {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  date_inscription?: string;
}

// Créer une réservation
export interface CreateReservationDto {
  seance_id: number;
  nb_places: number;
  sieges_ids: number[];
  utilisateur_id?: number;
}

// Réponse de création
export interface CreateReservationResponse {
  success: boolean;
  message: string;
  reservation: Reservation;
}

// Vérifier disponibilité
export interface VerifierDisponibiliteDto {
  seance_id: number;
  nb_places: number;
}

export interface DisponibiliteResponse {
  disponible: boolean;
  places_disponibles: number;
  message?: string;
}

// Filtre pour recherche de séances
export interface SeancesFilterDto {
  cinema_id?: number;
  film_id?: number;
  nb_places?: number;
  date_seance?: string; // Format YYYY-MM-DD
  qualite_projection?: QualiteProjection;
}

// MODÈLES FRONTEND SPÉCIFIQUES

export const DELAI_ANNULATION_HEURES = 2;
export const PLACES_MAX_PAR_RESERVATION = 10;
