import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-conditions',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="page">
      <h1>Conditions d'utilisation</h1>
      <p class="maj">Dernière mise à jour : octobre 2026</p>

      <h2>1. Objet</h2>
      <p>Les présentes conditions encadrent l'utilisation du site Cinephoria et la réservation de places de cinéma en ligne.</p>

      <h2>2. Compte utilisateur</h2>
      <p>La création d'un compte est nécessaire pour réserver. L'utilisateur s'engage à fournir des informations exactes et à garder son mot de passe confidentiel.</p>

      <h2>3. Réservation et paiement</h2>
      <p>Les places sont réservées pour une séance, une salle et un tarif précis, affichés avant la validation. Le paiement est sécurisé par un prestataire externe. La réservation est confirmée par e-mail une fois le paiement accepté.</p>

      <h2>4. Annulation</h2>
      <p>Les conditions d'annulation et de modification d'une réservation sont celles affichées au moment de la réservation.</p>

      <h2>5. Données personnelles</h2>
      <p>Le traitement de vos données est décrit dans notre <a routerLink="/politique-de-confidentialite">politique de confidentialité</a>.</p>

      <h2>6. Propriété intellectuelle</h2>
      <p>Les affiches, textes et visuels des films appartiennent à leurs ayants droit. Toute reproduction du site est interdite sans autorisation.</p>

      <h2>7. Droit applicable</h2>
      <p>Les présentes conditions sont soumises au droit français.</p>
    </main>
  `,
  styles: [`
    .page { max-width: 820px; margin: 0 auto; padding: 48px 20px; color: #e5e5e5; }
    h1 { color: #e50914; margin-bottom: 4px; }
    h2 { margin-top: 28px; font-size: 1.1rem; }
    .maj { color: #9a9a9a; font-size: .9rem; }
    a { color: #e50914; }
  `],
})
export class ConditionsComponent {}
