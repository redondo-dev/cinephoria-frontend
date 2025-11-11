// src/app/features/contact/contact.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ContactService } from './services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;
  isSubmitting = false;
  showSuccess = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      username: [''],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  get title() {
    return this.contactForm.get('title');
  }

  get description() {
    return this.contactForm.get('description');
  }

  onSubmit(): void {
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';

      this.contactService.sendMessage(this.contactForm.value).subscribe({
        next: (response) => {
          this.showSuccess = true;
          this.contactForm.reset();
          this.isSubmitting = false;

          // Masquer le message après 5 secondes
          setTimeout(() => {
            this.showSuccess = false;
          }, 5000);
        },
        error: (error) => {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
          this.isSubmitting = false;
        },
      });
    }
  }
}
