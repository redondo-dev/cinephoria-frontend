// src/app/services/users.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande } from '../../../core/models/commande.model';
import { Avis } from '../../../core/models/commande.model';
import { Film } from '../../../core/models/commande.model';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/utilisateur`;

  getMesCommandes(): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.apiUrl}/commandes`);
  }

  getFilmsDisponiblesPourAvis(): Observable<Film[]> {
    return this.http.get<Film[]>(`${this.apiUrl}/films-disponibles-avis`);
  }
}

// src/app/services/avis.service.ts

@Injectable({
  providedIn: 'root',
})
export class AvisService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/avis`;

  creerAvis(avis: Avis): Observable<Avis> {
    return this.http.post<Avis>(this.apiUrl, avis);
  }

  getAvisUtilisateur(filmId: number): Observable<Avis | null> {
    return this.http.get<Avis | null>(
      `${this.apiUrl}/utilisateur/film/${filmId}`
    );
  }

  modifierAvis(id: number, avis: Partial<Avis>): Observable<Avis> {
    return this.http.put<Avis>(`${this.apiUrl}/${id}`, avis);
  }
}
