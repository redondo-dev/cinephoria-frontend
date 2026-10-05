// src/app/admin/pages/salles/salles-list/salles-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, Salle } from '../../../services/admin.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-salles-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './salle-list.component.html',
  styleUrls: ['./salle-list.component.scss'],
})
export class SalleListComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastrService);

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
      this.adminService.deleteSalle(salle.id.toString()).subscribe({
        next: () => {
          this.salles = this.salles.filter((s) => s.id !== salle.id);
          this.toast.success('Salle supprimée avec succès');
        },
        error: (err) => {
          this.toast.error(
            err.message || 'Erreur lors de la suppression de la salle',
          );
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
