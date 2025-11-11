import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContactMessage {
  username?: string;
  email: string;
  title: string;
  description: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}/contact/send`;
  constructor(private http: HttpClient) {}

  sendMessage(data: ContactMessage): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(this.apiUrl, data);
  }
}
