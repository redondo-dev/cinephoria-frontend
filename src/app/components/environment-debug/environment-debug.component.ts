import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-environment-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="!environment.production"
         style="background: #ff4444; color: white; padding: 10px; border: 2px solid red; font-family: monospace;">
      ⚠️ ⚠️ ⚠️ MODE DEVELOPMENT ⚠️ ⚠️ ⚠️<br>
      🔗 API URL: {{ environment.apiUrl }}<br>
      📁 Fichier: environment.ts
    </div>

    <div *ngIf="environment.production"
         style="background: #00C851; color: white; padding: 10px; border: 2px solid green; font-family: monospace;">
      ✅ ✅ ✅ MODE PRODUCTION ✅ ✅ ✅<br>
      🔗 API URL: {{ environment.apiUrl }}<br>
      📁 Fichier: environment.prod.ts
    </div>
  `
})
export class EnvironmentDebugComponent {
  environment = environment;

  constructor() {
    console.log('=== ENVIRONMENT DEBUG ===');
    console.log('Production:', environment.production);
    console.log('API URL:', environment.apiUrl);
    console.log('File:', environment.production ? 'environment.prod.ts' : 'environment.ts');
    console.log('========================');
  }
}
