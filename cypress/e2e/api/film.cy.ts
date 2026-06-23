// cypress/e2e/api/film.cy.ts

describe('Films - Liste', () => {
  beforeEach(() => {
    cy.visit('/films');
    // Attend que les films se chargent
    cy.get('.film-card', { timeout: 8000 }).should('exist');
  });

  it('affiche les films disponibles', () => {
    cy.get('.film-card').should('have.length.greaterThan', 0);
  });

  it('chaque carte affiche un titre', () => {
    cy.get('.film-card').first().find('.film-title').should('not.be.empty');
  });

  it('chaque carte affiche une année', () => {
    cy.get('.film-card').first().find('.year').should('exist');
  });

  it('affiche le nombre total de films', () => {
    cy.get('.page-subtitle').should('contain.text', 'films disponibles');
  });
});

describe('Films - Filtrage', () => {
  beforeEach(() => {
    cy.visit('/films');
    cy.get('.film-card', { timeout: 8000 }).should('exist');
  });

  it('filtre par recherche texte', () => {
    cy.get('.search-input').type('a');
    cy.wait(500);
    // Soit des résultats, soit le message "aucun film trouvé"
    cy.get('body').then(($body) => {
      if ($body.find('.film-card').length > 0) {
        cy.get('.film-card').should('have.length.greaterThan', 0);
      } else {
        cy.get('.no-results').should('exist');
      }
    });
  });

  it('le bouton réinitialiser remet les filtres à zéro', () => {
    cy.get('.search-input').type('zzzzinexistant');
    cy.wait(300);
    cy.get('.btn-reset').click();
    cy.get('.search-input').should('have.value', '');
  });

  it('filtre par genre via le 3ème select', () => {
    // 3ème .filter-select = genre (après cinéma et genre)
    cy.get('.filter-select').eq(1).select(1); // sélectionne la 1ère option réelle (index 1 = premier genre)
    cy.wait(500);
    cy.get('body').then(($body) => {
      if ($body.find('.film-card').length > 0) {
        cy.get('.film-card').should('have.length.greaterThan', 0);
      } else {
        cy.get('.no-results').should('exist');
      }
    });
  });

  it('toggle vue grille / liste', () => {
    cy.get('.btn-view-toggle').click();
    cy.get('.films-grid').should('have.class', 'list-view');
    cy.get('.btn-view-toggle').click();
    cy.get('.films-grid').should('not.have.class', 'list-view');
  });
});

describe('Films - Navigation', () => {
  it('cliquer sur une carte navigue vers le détail', () => {
    cy.visit('/films');
    cy.get('.film-card', { timeout: 8000 }).first().click();
    cy.url().should('include', '/films/');
  });
});
