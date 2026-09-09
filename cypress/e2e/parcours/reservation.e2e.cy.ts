// cypress/e2e/parcours/reservation.e2e.cy.ts

const API = 'http://localhost:3000/api';

const TEST_USER = {
  email: 'test@cinema.fr',
  password: 'password123',
  captchaToken: '10000000-aaaa-bbbb-cccc-000000000001',
};

const FILM_ID_AVEC_SEANCES = 7;

describe("Parcours E2E - Réservation Cinephoria (jusqu'à l'initialisation du paiement)", () => {
  it('parcours complet : films → séance → sièges → réservation → confirmation → paiement', () => {
    cy.intercept('GET', '**/api/films*').as('getFilms');
    cy.intercept('GET', '**/api/seances/film/*').as('getSeances');

    cy.request({
      method: 'POST',
      url: `${API}/auth/login`,
      body: TEST_USER,
    }).then((res) => {
      const token = res.body.token;
      const userWithName = {
        ...res.body.user,
        name: `${res.body.user.prenom} ${res.body.user.nom}`,
      };

      // ---- 1. Liste des films ----
      cy.visitAsUser('/home', token, userWithName);
      cy.visitAsUser('/films', token, userWithName);
      cy.wait('@getFilms');
      cy.get('.film-card', { timeout: 10000 }).should(
        'have.length.greaterThan',
        0,
      );

      // ---- 2. Détail du film ----
      cy.visitAsUser(`/films/${FILM_ID_AVEC_SEANCES}`, token, userWithName);
      cy.url().should('include', '/films/');

      cy.wait('@getSeances').then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
        expect(
          interception.response?.body,
          'ce film doit avoir au moins une séance',
        ).to.have.length.greaterThan(0);
      });

      // ---- 3. Clic sur "Réserver" ----
      cy.get('.btn.btn-primary.btn-full', { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.url({ timeout: 10000 }).should('include', '/reservation/sieges');

      // ---- 4. Sélection d'un siège ----
      cy.get('.seat.available', { timeout: 10000 })
        .should('have.length.greaterThan', 0)
        .first()
        .click();
      cy.get('.confirm-btn').should('not.be.disabled').click();

      // ---- 5. Page confirmation, utilisateur connecté ----
      cy.url({ timeout: 10000 }).should('include', '/reservation/confirmation');
      cy.get('.auth-prompt').should('not.exist');
      cy.get('.continue-btn').should('be.visible').click();

      // ---- 6. Page paiement — le formulaire Stripe se charge correctement ----
      cy.url({ timeout: 10000 }).should('include', '/reservation/payment');
      cy.get('#stripe-card-element', { timeout: 10000 }).should('be.visible');
      cy.get('.btn-pay', { timeout: 10000 }).should('exist');

      // Le paiement Stripe lui-même (saisie carte + confirmation) est démontré
      // manuellement — voir manuel d'utilisation. Stripe Elements déclenche un
      // mécanisme anti-bot (Radar) qui interfère avec les navigateurs automatisés.
    });
  });
});

export {};
