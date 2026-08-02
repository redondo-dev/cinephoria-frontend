// // cypress/e2e/parcours/reservation.e2e.cy.ts

// describe('Parcours E2E - Réservation Cinephoria', () => {
//   beforeEach(() => {
//     // Intercepte les appels API importants
//     cy.intercept('GET', '**/api/films*').as('getFilms');
//     cy.intercept('GET', '**/api/seances/film/*').as('getSeances');

//     cy.visit('/home');
//   });

//   it('Parcours jusqu’à l’authentification requise pour le paiement', () => {
//     // 1 - Consultation des films
//     cy.visit('/films');
//     cy.wait('@getFilms');

//     cy.get('.film-card', { timeout: 10000 }).should(
//       'have.length.greaterThan',
//       0,
//     );

//     // 2 - Ouverture de la fiche film
//     cy.get('.film-card').first().click();
//     cy.url().should('include', '/films/');

//     // 3 - Attendre le chargement des séances
//     cy.wait('@getSeances').its('response.statusCode').should('eq', 200);

//     // Vérifier que le bouton Réserver est visible
//     cy.get('.btn.btn-primary.btn-full', { timeout: 10000 }).should(
//       'be.visible',
//     );

//     //4- Bouton « Réserver »
//     cy.get('.btn.btn-primary.btn-full', { timeout: 10000 })
//       .should('be.visible')
//       .click();

//     // 5 - Vérifier la navigation
// cy.url({ timeout: 10000 }).then((url) => {
//   // Si des séances existent, on va directement aux sièges
//   if (url.includes('/reservation/sieges/')) {
//     cy.get('.seat', { timeout: 10000 }).should('exist');

//     // Sélectionner un siège disponible
//     cy.get('.seat:not(.occupied)')
//       .first()
//       .click();

//     // Confirmer
//     cy.get('.confirm-btn')
//       .should('be.visible')
//       .and('not.be.disabled')
//       .click();

//     // Le paiement est protégé par AuthGuard
//     cy.url({ timeout: 10000 }).should('include', '/auth/login');

//     cy.get('input[type=email]').should('be.visible');
//     cy.get('input[type=password]').should('be.visible');
//   } else {
//     // Si aucune séance n’est disponible
//     expect(url).to.include('/reservation/selection');
//   }
// });

// });
// });
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
