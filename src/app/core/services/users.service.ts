// src/app/core/services/users.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande } from '../models/commande.model';
import { Film } from '../models/commande.model';
import { environment } from '../../../environments/environment';
import { map, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/user`;

  /**
   * Récupère toutes les commandes/réservations de l'utilisateur
   * GET /user/commandes
   */
getMesCommandes(): Observable<Commande[]> {
    console.log('🔍 [USERS SERVICE] URL appelée:', `${this.apiUrl}/commandes`);

    return this.http.get<any>(`${this.apiUrl}/commandes`).pipe(
      tap(response => {
        console.log('📦 [USERS SERVICE] Réponse complète:', response);
        console.log('📊 [USERS SERVICE] Données brutes:', response.data);
        console.log('🔢 [USERS SERVICE] Type de données:', typeof response.data);
      }),
      map((response) => {
        // CORRECTION : "data" au lieu de "date"
        const commandes = response.data || [];
        console.log('✅ [USERS SERVICE] Commandes extraites:', commandes);
        return commandes;
      }),
      catchError(error => {
        console.error('❌ [USERS SERVICE] Erreur:', error);
        return of([]); // Retourne un tableau vide en cas d'erreur
      })
    );
  }
  /**
   * Récupère une commande spécifique par ID
   * GET /user/commandes/:id
   */
  getCommandeById(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/commandes/${id}`);
  }

  /**
   * Récupère les films que l'utilisateur peut noter
   * GET /user/films-a-noter
   */
  getFilmsANoter(): Observable<{ count: number; films: Film[] }> {
    return this.http.get<{ count: number; films: Film[] }>(
      `${this.apiUrl}/films-a-noter`
    );
  }

  /**
   * Récupère le profil de l'utilisateur
   * GET /user/profile
   */
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }
}
