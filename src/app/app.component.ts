import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
<<<<<<< HEAD
import { NavbarComponent } from './shared/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet, NavbarComponent],
=======
import { FooterComponent } from './shared/footer/footer.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,FooterComponent],
>>>>>>> feature/us3-footer
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})





export class AppComponent {
  title = 'cinephoria-frontend';

}
