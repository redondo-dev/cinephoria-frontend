beforeEach(() => {
  cy.clearLocalStorage();
  cy.clearCookies();
});

describe('Login Cinephoria', () => {
  it('doit connecter un utilisateur', () => {
    cy.visit('/login');

    cy.url().then((url) => {
      cy.log('URL ACTUELLE: ' + url);
    });

    cy.get('body').then(($body) => {
      cy.log($body.html());
    });
  });
});
