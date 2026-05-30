describe('Films - Liste', () => {

  it('doit afficher les films disponibles', () => {

    cy.visit('/films');

    cy.get('.film-card').should('have.length.greaterThan', 0);

    cy.get('.film-card').first().should('contain.text', 'Film');

  });

});

describe('Films - Filtrage', () => {

  it('doit filtrer les films par genre', () => {

    cy.visit('/films');

    cy.get('select[name=genre]').select('Action');

    cy.get('.film-card').each(($el) => {
      cy.wrap($el).should('contain.text', 'Action');
    });

  });

});
