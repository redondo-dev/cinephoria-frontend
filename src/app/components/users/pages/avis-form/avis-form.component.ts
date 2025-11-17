// src/app/components/users/avis-form/avis-form.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  AvisService,
  CreateAvisDto,
  UpdateAvisDto,
} from '../../../../core/services/avis.service';
import { Film, Avis } from '../../../../core/models/commande.model';

@Component({
  selector: 'app-avis-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './avis-form.component.html',
  styleUrls: ['./avis-form.component.scss'],
})
export class AvisFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private avisService = inject(AvisService);

  @Input({ required: true }) film!: Film;
  @Output() fermer = new EventEmitter<void>();
  @Output() avisEnvoye = new EventEmitter<void>();

  avisForm!: FormGroup;
  noteSelectionnee = signal(0);
  submitting = signal(false);
  errorMessage = signal<string | null>(null);
  avisExistant = signal<Avis | null>(null);

  ngOnInit(): void {
    this.initForm();
    this.chargerAvisExistant();
  }

  initForm(): void {
    this.avisForm = this.fb.group({
      note: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  chargerAvisExistant(): void {
    this.avisService.getAvisUtilisateur(this.film.id).subscribe({
      next: (avis) => {
        if (avis) {
          this.avisExistant.set(avis);
          this.noteSelectionnee.set(avis.note);
          this.avisForm.patchValue({
            note: avis.note,
            description: avis.contenu,
          });
        }
      },
      error: (err) => console.error("Erreur lors du chargement de l'avis", err),
    });
  }

  selectionnerNote(note: number): void {
    this.noteSelectionnee.set(note);
    this.avisForm.patchValue({ note });
  }

  onSubmit(): void {
    if (this.avisForm.invalid) return;

    this.submitting.set(true);
    this.errorMessage.set(null);

    // Mapper les champs du formulaire vers le DTO backend
    const formValue = this.avisForm.value;

    if (this.avisExistant()) {
      // Modification d'un avis existant
      const updateData: UpdateAvisDto = {
        note: formValue.note,
        contenu: formValue.description, // description (form) -> contenu (backend)
      };

      this.avisService
        .modifierAvis(this.avisExistant()!.id!, updateData)
        .subscribe({
          next: (response) => {
            this.submitting.set(false);
            console.log('✅', response.message);
            this.avisEnvoye.emit();
          },
          error: (err) => {
            this.submitting.set(false);
            this.errorMessage.set(
              err.error?.message ||
                'Une erreur est survenue lors de la modification de votre avis'
            );
            console.error(' Erreur modification:', err);
          },
        });
    } else {
      // Création d'un nouvel avis
      const createData: CreateAvisDto = {
        film_id: this.film.id,
        note: formValue.note,
        contenu: formValue.description, // description (form) -> contenu (backend)
      };

      this.avisService.creerAvis(createData).subscribe({
        next: (response) => {
          this.submitting.set(false);
          console.log('✅', response.message);
          this.avisEnvoye.emit();
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(
            err.error?.message ||
              "Une erreur est survenue lors de l'envoi de votre avis"
          );
          console.error(' Erreur création:', err);
        },
      });
    }
  }

  onFermer(): void {
    this.fermer.emit();
  }
}
