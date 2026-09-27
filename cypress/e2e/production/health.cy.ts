// cypress/e2e/production/health.cy.ts
describe('Health check Render', () => {
  // Timeout étendu à 60s : l'offre gratuite Render met le service en veille après
  // inactivité, et son réveil (cold start) peut largement dépasser les 30s par défaut
  // de cy.request(), faisant échouer le test alors que le service fonctionne bien.
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
