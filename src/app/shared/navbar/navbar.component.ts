import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  menuOpen = false;
  isAuthenticated$!: Observable<boolean>;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
  constructor(public authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }

  // searchFilm(event: any): void {
  //   const searchTerm = event.target.value;
  //   if (searchTerm.trim()) {
  //     console.log('Recherche:', searchTerm);
  //     // À implémenter: naviguer vers la page films avec filtre
  //   }
  // }
}
