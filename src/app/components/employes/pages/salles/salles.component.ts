import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SallesService, Salle } from '../../services/employes.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../environments/environment';

interface Cinema {
  id: number;
  nom: string;
  ville: string;
}

@Component({
  selector: 'app-salles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salles.component.html',
  styleUrl: './salles.component.scss',
})
export class SallesComponent implements OnInit {
  salles: Salle[] = [];
  cinemas: Cinema[] = [];
  currentSalle: Salle = this.initSalle();
  showForm = false;

  constructor(
    private sallesService: SallesService,
    private http: HttpClient,
    private toast: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadSalles();
    this.loadCinemas();
  }

  loadSalles(): void {
    this.sallesService.getAll().subscribe({
      next: (salles) => (this.salles = salles),
      error: (err) => console.error('Erreur chargement salles', err),
    });
  }

  loadCinemas(): void {
    this.http.get<Cinema[]>(`${environment.apiUrl}/api/cinemas`).subscribe({
      next: (data: any) => (this.cinemas = data?.data || data || []),
      error: (err) => console.error('Erreur chargement cinémas', err),
    });
  }

  saveSalle(): void {
    if (this.currentSalle.id) {
      this.sallesService
        .update(this.currentSalle.id, this.currentSalle)
        .subscribe({
          next: () => {
            this.toast.success('Salle modifiée avec succès');
            this.loadSalles();
            this.resetForm();
          },
          error: (err) => {
            this.toast.error(
              err.message || 'Erreur lors de la modification de la salle',
            );
            console.error('Erreur modification', err);
          },
        });
    } else {
      this.sallesService.create(this.currentSalle).subscribe({
        next: () => {
          this.toast.success('Salle créée avec succès');
          this.loadSalles();
          this.resetForm();
        },
        error: (err) => {
          this.toast.error(
            err.message || 'Erreur lors de la création de la salle',
          );
          console.error('Erreur création', err);
        },
      });
    }
  }

  editSalle(salle: Salle): void {
    this.currentSalle = { ...salle };
    this.showForm = true;
  }

  deleteSalle(id: number): void {
    if (confirm('Confirmer la suppression ?')) {
      this.sallesService.delete(id).subscribe({
        next: () => {
          this.toast.success('Salle supprimée avec succès');
          this.loadSalles();
        },
        error: (err) => {
          this.toast.error(
            err.message || 'Erreur lors de la suppression de la salle',
          );
          console.error('Erreur suppression', err);
        },
      });
    }
  }

  resetForm(): void {
    this.currentSalle = this.initSalle();
    this.showForm = false;
  }

  private initSalle(): Salle {
    return {
      nom: '',
      nombrePlaces: 0,
      qualiteProjection: 'Standard',
      cinema_id: undefined,
    };
  }
}
