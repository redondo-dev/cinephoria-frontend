// src/app/components/reservation/seat-selection/seat-selection.component.cy.ts
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { SeatSelectionComponent } from './seat-selection.component';
import { mount } from 'cypress/angular';
import { CommonModule } from '@angular/common';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ReservationService } from '../../../core/services/reservation.service';
import { of, throwError } from 'rxjs';

// ─── Mock ReservationService ──────────────────────────────
const mockSieges = [
  {
    id: 1,
    rangee: 'A',
    numero_siege: 1,
    type_siege: 'classique',
    salle_id: 5,
    disponible: true,
  },
  {
    id: 2,
    rangee: 'A',
    numero_siege: 2,
    type_siege: 'classique',
    salle_id: 5,
    disponible: true,
  },
  {
    id: 3,
    rangee: 'A',
    numero_siege: 3,
    type_siege: 'pmr',
    salle_id: 5,
    disponible: true,
  },
  {
    id: 4,
    rangee: 'B',
    numero_siege: 1,
    type_siege: 'premium',
    salle_id: 5,
    disponible: false,
  },
  {
    id: 5,
    rangee: 'B',
    numero_siege: 2,
    type_siege: 'classique',
    salle_id: 5,
    disponible: true,
  },
];

const mockReservationData = {
  film: { titre: 'Dune 2' },
  cinema: { nom: 'Cinephoria Paris' },
  seance: { horaire: '20:00' },
  nombrePersonnes: 2,
};

// Enregistre la locale une seule fois avant les tests
registerLocaleData(localeFr);

// Dans la fonction mountComponent, ajoute LOCALE_ID dans providers
function mountComponent(
  siegesResponse: any,
  sessionData = mockReservationData,
) {
  sessionStorage.setItem('reservationData', JSON.stringify(sessionData));

  const mockReservationService = {
    getSiegesBySeance: cy.stub().returns(of({ sieges: siegesResponse })),
  };

  return mount(SeatSelectionComponent, {
    imports: [CommonModule],
    providers: [
      provideRouter([]),
      { provide: LOCALE_ID, useValue: 'fr-FR' },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { paramMap: { get: () => '15' } },
        },
      },
      {
        provide: ReservationService,
        useValue: mockReservationService,
      },
    ],
  });
}

// ─── Tests ────────────────────────────────────────────────
describe('SeatSelectionComponent', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  // ── Affichage ──────────────────────────────────────────
  describe('Affichage initial', () => {
    it('affiche le titre du film', () => {
      mountComponent(mockSieges);
      cy.contains('Dune 2').should('exist');
    });

    it("affiche le nom du cinema et l'horaire", () => {
      mountComponent(mockSieges);
      cy.contains('Cinephoria Paris').should('exist');
      cy.contains('20:00').should('exist');
    });

    it("affiche l'ecran cinema", () => {
      mountComponent(mockSieges);
      cy.contains('ÉCRAN').should('exist');
    });

    it('affiche la grille de sieges', () => {
      mountComponent(mockSieges);
      cy.get('.seat').should('have.length', 5);
    });

    it('affiche les rangees correctement (A et B)', () => {
      mountComponent(mockSieges);
      cy.get('.row-label').should('contain', 'A');
      cy.get('.row-label').should('contain', 'B');
    });

    it('affiche la legende', () => {
      mountComponent(mockSieges);
      cy.get('.legend').should('exist');
      cy.contains('Disponible').should('exist');
      cy.contains('Sélectionné').should('exist');
      cy.contains('Occupé').should('exist');
      cy.contains('PMR').should('exist');
    });
  });

  // ── Etat des sieges ────────────────────────────────────
  describe('Etat visuel des sieges', () => {
    it('les sieges disponibles ont la classe available', () => {
      mountComponent(mockSieges);
      cy.get('.seat.available').should('have.length.greaterThan', 0);
    });

    it('les sieges occupes ont la classe occupied', () => {
      mountComponent(mockSieges);
      cy.get('.seat.occupied').should('have.length', 1);
    });

    it('les sieges PMR ont la classe pmr', () => {
      mountComponent(mockSieges);
      cy.get('.seat.pmr').should('have.length', 1);
    });

    it('les sieges premium ont la classe premium', () => {
      mountComponent(mockSieges);
      cy.get('.seat.premium').should('have.length', 1);
    });

    it("les sieges PMR affichent l'icone accessibilite", () => {
      mountComponent(mockSieges);
      cy.get('.seat.pmr .pmr-icon').should('exist');
    });
  });

  // ── Selection de sieges ────────────────────────────────
  describe('Selection des sieges', () => {
    it('bouton confirmer desactive si aucun siege selectionne', () => {
      mountComponent(mockSieges);
      cy.get('.confirm-btn').should('be.disabled');
    });

    it('cliquer sur un siege disponible le selectionne', () => {
      mountComponent(mockSieges);
      cy.get('.seat.available').first().click();
      cy.get('.seat.selected').should('have.length', 1);
    });

    it('le siege selectionne apparait dans le recapitulatif', () => {
      mountComponent(mockSieges);
      cy.get('.seat.available').first().click();
      cy.get('.seats-list').should('not.contain', 'Aucun siège sélectionné');
    });

    it('le prix total est mis a jour apres selection', () => {
      mountComponent(mockSieges);
      cy.get('.seat.available').first().click();
      cy.get('.price').should('not.contain', '0,00');
    });

    it('cliquer deux fois sur un siege le deselectionne', () => {
      mountComponent(mockSieges);
      cy.get('.seat.available').first().click();
      cy.get('.seat.selected').should('have.length', 1);
      cy.get('.seat.selected').first().click();
      cy.get('.seat.selected').should('have.length', 0);
    });

    it('ne peut pas selectionner plus de sieges que nombrePersonnes (2)', () => {
      mountComponent(mockSieges);
      cy.get('.seat.available').eq(0).click();
      cy.get('.seat.available').eq(1).click();
      cy.get('.seat.available').eq(2).click(); // 3eme clic — doit etre ignore
      cy.get('.seat.selected').should('have.length', 2);
    });

    it('bouton confirmer actif quand le bon nombre de sieges est selectionne', () => {
      mountComponent(mockSieges);
      cy.get('.seat.available').eq(0).click();
      cy.get('.seat.available').eq(1).click();
      cy.get('.confirm-btn').should('not.be.disabled');
    });

    it('le compteur dans le bouton se met a jour', () => {
      mountComponent(mockSieges);
      cy.get('.confirm-btn').should('contain', '0/2');
      cy.get('.seat.available').first().click();
      cy.get('.confirm-btn').should('contain', '1/2');
    });
  });

  // ── Siege occupe ───────────────────────────────────────
  describe('Siege indisponible', () => {
    it('cliquer sur un siege occupe ne le selectionne pas', () => {
      mountComponent(mockSieges);
      cy.get('.seat.occupied').click();
      cy.get('.seat.selected').should('have.length', 0);
    });
  });

  // ── Prix par type ──────────────────────────────────────
  describe('Calcul du prix', () => {
    it('affiche 0,00 EUR avant toute selection', () => {
      mountComponent(mockSieges);
      cy.get('.price').should('contain', '0,00');
    });

    it("le total augmente apres selection d'un siege", () => {
      mountComponent(mockSieges);
      cy.get('.seat.available').first().click();
      // Siege classique = 10.50€
      cy.get('.price').should('contain', '10,50');
    });
  });

  // ── Erreur chargement ──────────────────────────────────
  describe('Gestion des erreurs', () => {
    it("affiche un message d'erreur si l'API echoue", () => {
      sessionStorage.setItem(
        'reservationData',
        JSON.stringify(mockReservationData),
      );

      const mockServiceError = {
        getSiegesBySeance: cy
          .stub()
          .returns(throwError(() => new Error('API Error'))),
      };

      mount(SeatSelectionComponent, {
        imports: [CommonModule],
        providers: [
          provideRouter([]),
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { paramMap: { get: () => '15' } } },
          },
          { provide: ReservationService, useValue: mockServiceError },
        ],
      });

      cy.get('.error-message').should('exist');
      cy.contains('Impossible de charger les sièges').should('exist');
    });

    it("affiche le bouton reessayer en cas d'erreur", () => {
      sessionStorage.setItem(
        'reservationData',
        JSON.stringify(mockReservationData),
      );

      const mockServiceError = {
        getSiegesBySeance: cy
          .stub()
          .returns(throwError(() => new Error('API Error'))),
      };

      mount(SeatSelectionComponent, {
        imports: [CommonModule],
        providers: [
          provideRouter([]),
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { paramMap: { get: () => '15' } } },
          },
          { provide: ReservationService, useValue: mockServiceError },
        ],
      });

      cy.get('.retry-btn').should('exist');
    });
  });

  // ── Aucun siege ────────────────────────────────────────
  describe('Salle sans sieges', () => {
    it('affiche message si aucun siege disponible', () => {
      mountComponent([]);
      cy.contains('Aucun siège disponible').should('exist');
    });
  });
});
