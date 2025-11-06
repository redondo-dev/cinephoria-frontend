// src/app/admin/pages/salles/salles-list/salles-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, Salle} from '../../../services/admin.service';

@Component({
  selector: 'app-salles-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './salle-list.component.html',
  styleUrls:['./salle-list.component.scss'],
})
export class SalleListComponent implements OnInit {
  private adminService = inject(AdminService);

  salles: Salle[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.loadSalles();
  }

  loadSalles() {
    this.loading = true;
    this.adminService.getSalles().subscribe({
      next: (data) => {
        this.salles = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des salles';
        this.loading = false;
        console.error(err);
      },
    });
  }

  deleteSalle(salle: Salle) {
    if (
      !confirm(`Êtes-vous sûr de vouloir supprimer la salle "${salle.nom}" ?`)
    ) {
      return;
    }

    if (salle.id) {
      this.adminService.deleteSalle(salle.id).subscribe({
        next: () => {
          this.salles = this.salles.filter((s) => s.id !== salle.id);
        },
        error: (err) => {
          alert('Erreur lors de la suppression de la salle');
          console.error(err);
        },
      });
    }
  }

  getQualityClass(qualite?: string): string {
    if (!qualite) return 'standard';
    return qualite.toLowerCase().replace(' ', '-');
  }
}
