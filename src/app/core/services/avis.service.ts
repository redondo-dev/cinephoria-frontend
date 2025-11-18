// src/app/core/services/avis.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Avis } from '../models/commande.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AvisService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/user/avis`;

  /**
   * Crée un nouvel avis
   * POST /user/avis
   * Body: { film_id, note, contenu }
   */
  creerAvis(avis: CreateAvisDto): Observable<{ message: string; avis: Avis }> {
    return this.http.post<{ message: string; avis: Avis }>(this.apiUrl, avis);
  }

  /**
   * Récupère tous les avis de l'utilisateur
   * GET /user/avis
   */
  getMesAvis(): Observable<{ count: number; avis: Avis[] }> {
    return this.http.get<{ count: number; avis: Avis[] }>(this.apiUrl);
  }

  /**
   * Récupère l'avis de l'utilisateur pour un film spécifique
   * GET /user/avis/film/:filmId
   * Retourne null si aucun avis n'existe
   */
  getAvisUtilisateur(filmId: number): Observable<Avis | null> {
    return this.http.get<Avis | null>(`${this.apiUrl}/film/${filmId}`);
  }

  /**
   * Modifie un avis existant
   * PUT /user/avis/:id
   * Body: { note?, contenu? }
   */
  modifierAvis(
    id: number,
    avis: UpdateAvisDto
  ): Observable<{ message: string; avis: Avis }> {
    return this.http.put<{ message: string; avis: Avis }>(
      `${this.apiUrl}/${id}`,
      avis
    );
  }

  /**
   * Supprime un avis (si tu l'implémente plus tard)
   * DELETE /user/avis/:id
   */
  supprimerAvis(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}

// ========================================
// DTOs pour typage strict
// ========================================

export interface CreateAvisDto {
  film_id: number;
  note: number; // 1-5
  contenu: string; // min 10 caractères
}

export interface UpdateAvisDto {
  note?: number;
  contenu?: string;
}
