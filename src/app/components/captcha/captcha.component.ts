import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxTurnstileModule } from 'ngx-turnstile';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-captcha',
  standalone: true,
  imports: [CommonModule, NgxTurnstileModule],
  templateUrl: './captcha.component.html',
  styleUrl: './captcha.component.scss',
})
export class CaptchaComponent {
  @Input() showError = false;
  @Output() tokenResolved = new EventEmitter<string | null>();

  constructor() {
    console.log('🔑 Turnstile siteKey:', this.siteKey);
  }
  siteKey = environment.turnstileSiteKey;

  onResolved(token: string | null): void {
    console.log('✅ CAPTCHA token reçu:', token);
    this.tokenResolved.emit(token);
  }

  onError(): void {
    console.error('❌ Erreur CAPTCHA');
    this.tokenResolved.emit(null);
  }
}
