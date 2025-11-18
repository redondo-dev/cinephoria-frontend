// avis-form.component.ts
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
      contenu: ['', [Validators.required, Validators.minLength(10)]], // Changé de 'description' à 'contenu'
    });

    // Écouter les changements de note pour mettre à jour le signal
    this.avisForm.get('note')?.valueChanges.subscribe(note => {
      this.noteSelectionnee.set(note);
    });
  }

  chargerAvisExistant(): void {
    console.log('🔍 Chargement avis existant pour film:', this.film.id);

    this.avisService.getAvisUtilisateur(this.film.id).subscribe({
      next: (avis) => {
        console.log('✅ Avis existant:', avis);
        if (avis) {
          this.avisExistant.set(avis);
          this.noteSelectionnee.set(avis.note);
          this.avisForm.patchValue({
            note: avis.note,
            contenu: avis.contenu, // Changé de 'description' à 'contenu'
          });
        }
      },
      error: (err) => {
        console.error("❌ Erreur lors du chargement de l'avis", err);
        // Ne pas afficher d'erreur si c'est juste qu'il n'y a pas d'avis
        if (err.status !== 404) {
          this.errorMessage.set('Erreur lors du chargement de votre avis existant');
        }
      },
    });
  }

  selectionnerNote(note: number): void {
    console.log('⭐ Note sélectionnée:', note);
    this.noteSelectionnee.set(note);
    this.avisForm.patchValue({ note });
    this.avisForm.get('note')?.markAsTouched();
  }

  onSubmit(): void {
    console.log('📤 Soumission du formulaire');

    // Marquer tous les champs comme touchés pour afficher les erreurs
    this.avisForm.markAllAsTouched();

    if (this.avisForm.invalid) {
      console.log('❌ Formulaire invalide');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const formValue = this.avisForm.value;
    console.log('📝 Données du formulaire:', formValue);

    if (this.avisExistant()) {
      // Modification d'un avis existant
      const updateData: UpdateAvisDto = {
        note: formValue.note,
        contenu: formValue.contenu, // Utiliser 'contenu' au lieu de 'description'
      };

      console.log('✏️ Modification avis:', updateData);

      this.avisService
        .modifierAvis(this.avisExistant()!.id!, updateData)
        .subscribe({
          next: (response) => {
            console.log('✅ Avis modifié:', response);
            this.submitting.set(false);
            this.avisEnvoye.emit();
          },
          error: (err) => {
            console.error('❌ Erreur modification:', err);
            this.submitting.set(false);
            this.errorMessage.set(
              err.error?.message ||
                'Une erreur est survenue lors de la modification de votre avis'
            );
          },
        });
    } else {
      // Création d'un nouvel avis
      const createData: CreateAvisDto = {
        film_id: this.film.id,
        note: formValue.note,
        contenu: formValue.contenu, // Utiliser 'contenu' au lieu de 'description'
      };

      console.log('🆕 Création avis:', createData);

      this.avisService.creerAvis(createData).subscribe({
        next: (response) => {
          console.log('✅ Avis créé:', response);
          this.submitting.set(false);
          this.avisEnvoye.emit();
        },
        error: (err) => {
          console.error('❌ Erreur création:', err);
          this.submitting.set(false);
          this.errorMessage.set(
            err.error?.message ||
              "Une erreur est survenue lors de l'envoi de votre avis"
          );
        },
      });
    }
  }

  onFermer(): void {
    console.log('🔒 Fermeture du modal');
    this.fermer.emit();
  }
}
