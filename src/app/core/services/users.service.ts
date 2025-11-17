// src/app/core/services/users.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande } from '../models/commande.model';
import { Film } from '../models/commande.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/user`;

  /**
   * Récupère toutes les commandes/réservations de l'utilisateur
   * GET /user/commandes
   */
  getMesCommandes(): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.apiUrl}/commandes`);
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
