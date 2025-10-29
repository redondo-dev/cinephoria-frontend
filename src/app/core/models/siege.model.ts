// core/models/siege.model.ts
export interface Siege {
  id: number;
  numero_siege: number;
  rangee: string;
  type_siege: 'classique' | 'premium' | 'pmr';
  salle_id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiegeWithStatus extends Siege {
  isAvailable: boolean; // Calculé selon les réservations
  isSelected: boolean; // État local front
  price: number; // Prix selon le type de séance
}
