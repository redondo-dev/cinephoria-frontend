// cypress/e2e/production/health.cy.ts
describe('Health check Render', () => {
  // Réveille le service AVANT les vrais tests, sans faire échouer le hook si ça
  // prend trop de temps. Render met les services en veille après 15 minutes
  // le service en veille après inactivité, et son réveil (cold start) peut
  // largement dépasser les 30s par défaut de cy.request(). Ce warm-up absorbe le
  // cold start en amont plutôt que de faire échouer un vrai test dessus.
  before(() => {
    cy.request({
      url: 'https://cinephoria-backend-xayv.onrender.com/api/films',
      timeout: 120000,
      failOnStatusCode: false,
    });
  });

  it('API Render répond', () => {
    cy.request({
      url: 'https://cinephoria-backend-xayv.onrender.com/api/films',
      timeout: 60000,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('films');
    });
  });

  it('base de données Render accessible', () => {
    cy.request({
      url: 'https://cinephoria-backend-xayv.onrender.com/api/films?limit=1',
      timeout: 60000,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.films).to.be.an('array');
    });
  });
});
