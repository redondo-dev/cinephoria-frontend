import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { environment } from '../environments/environment';
import { EnvironmentDebugComponent } from './components/environment-debug/environment-debug.component'

console.log('ENV ACTIF =', environment);
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent,EnvironmentDebugComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'cinephoria-frontend';



}
