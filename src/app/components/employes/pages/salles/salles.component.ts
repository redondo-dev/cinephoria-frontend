
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SallesService, Salle } from '../../services/employes.service';

@Component({
  selector: 'app-salles',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './salles.component.html',
  styleUrl: './salles.component.scss'
})
export class SallesComponent implements OnInit {
  salles: Salle[] = [];
  currentSalle: Salle = this.initSalle();
  showForm = false;

  constructor(private sallesService: SallesService) {}

  ngOnInit(): void {
    this.loadSalles();
  }

  loadSalles(): void {
    this.sallesService.getAll().subscribe({
      next: (salles) => this.salles = salles,
      error: (err) => console.error('Erreur chargement salles', err)
    });
  }

  saveSalle(): void {
    if (this.currentSalle.id) {
      this.sallesService.update(this.currentSalle.id, this.currentSalle).subscribe({
        next: () => {
          this.loadSalles();
          this.resetForm();
        },
        error: (err) => console.error('Erreur modification', err)
      });
    } else {
      this.sallesService.create(this.currentSalle).subscribe({
        next: () => {
          this.loadSalles();
          this.resetForm();
        },
        error: (err) => console.error('Erreur création', err)
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
        next: () => this.loadSalles(),
        error: (err) => console.error('Erreur suppression', err)
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
      qualiteProjection: 'Standard'
    };
  }
}
