import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SeancesService,
  Seance,
  FilmsService,
  Film,
  SallesService,
  Salle,
} from '../../services/employes.service';

@Component({
  selector: 'app-seances',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seances.component.html',
  styleUrls: ['./seances.component.scss'],
})
export class SeancesComponent implements OnInit {
  seances: Seance[] = [];
  films: Film[] = [];
  salles: Salle[] = [];
  currentSeance: Seance = this.initSeance();
  showForm = false;

  constructor(
    private seancesService: SeancesService,
    private filmsService: FilmsService,
    private sallesService: SallesService
  ) {}

  ngOnInit(): void {
    this.loadSeances();
    this.loadFilms();
    this.loadSalles();
  }

  loadSeances(): void {
    this.seancesService.getAll().subscribe({
      next: (seances) => (this.seances = seances),
      error: (err) => console.error('Erreur chargement séances', err),
    });
  }

  loadFilms(): void {
    this.filmsService.getAll().subscribe({
      next: (films) => (this.films = films),
      error: (err) => console.error('Erreur chargement films', err),
    });
  }

  loadSalles(): void {
    this.sallesService.getAll().subscribe({
      next: (salles) => (this.salles = salles),
      error: (err) => console.error('Erreur chargement salles', err),
    });
  }

  saveSeance(): void {
    if (this.currentSeance.id) {
      this.seancesService
        .update(this.currentSeance.id, this.currentSeance)
        .subscribe({
          next: () => {
            this.loadSeances();
            this.resetForm();
          },
          error: (err) => console.error('Erreur modification', err),
        });
    } else {
      this.seancesService.create(this.currentSeance).subscribe({
        next: () => {
          this.loadSeances();
          this.resetForm();
        },
        error: (err) => console.error('Erreur création', err),
      });
    }
  }

  editSeance(seance: Seance): void {
    this.currentSeance = { ...seance };
    this.showForm = true;
  }

  deleteSeance(id: number): void {
    if (confirm('Confirmer la suppression ?')) {
      this.seancesService.delete(id).subscribe({
        next: () => this.loadSeances(),
        error: (err) => console.error('Erreur suppression', err),
      });
    }
  }

  resetForm(): void {
    this.currentSeance = this.initSeance();
    this.showForm = false;
  }

  private initSeance(): Seance {
    return {
      filmId: 0,
      salleId: 0,
      date_seance: '', 
      dateHeureDebut: '',
      dateHeureFin: '',
    };
  }
}
