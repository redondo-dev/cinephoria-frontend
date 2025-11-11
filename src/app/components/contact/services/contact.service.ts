// src/app/features/contact/services/contact.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactMessage {
  username?: string;
  title: string;
  description: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = '/api/contact';

  constructor(private http: HttpClient) {}

  sendMessage(data: ContactMessage): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(this.apiUrl, data);
  }
}
