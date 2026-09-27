
// cypress/e2e/parcours/reservation.e2e.cy.ts

describe('Parcours E2E - Réservation Cinephoria', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/films*').as('getFilms');
    cy.intercept('GET', '**/api/seances/film/*').as('getSeances');

    cy.visit('/home');
  });

  it('Parcours utilisateur jusqu’à la réservation', () => {
    // 1 - Liste des films
    cy.visit('/films');
    cy.wait('@getFilms');

    cy.get('.film-card', { timeout: 10000 }).should(
      'have.length.greaterThan',
      0,
    );

    // 2 - Détail du film
    cy.get('.film-card').first().click();
    cy.url().should('include', '/films/');

    // 3 - Les séances sont chargées
    cy.wait('@getSeances').its('response.statusCode').should('eq', 200);

    // 4 - Bouton Réserver disponible
    cy.get('.btn.btn-primary.btn-full', { timeout: 10000 })
      .should('be.visible')
      .click();

    // 5 - Vérification de la navigation
    cy.url({ timeout: 10000 }).should(
      'match',
      /reservation\/(sieges|selection)/,
    );

    // 6 - Vérification que la page de réservation est bien affichée
    cy.get('body').should('be.visible');
  });
});
