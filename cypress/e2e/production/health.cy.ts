// cypress/e2e/production/health.cy.ts
describe('Health check Render', () => {

  it('API Render répond', () => {
    cy.request('https://cinephoria-backend-cja3.onrender.com/api/films')
      .then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.have.property('films')
      })
  })

  it('base de données Render accessible', () => {
    cy.request('https://cinephoria-backend-cja3.onrender.com/api/films?limit=1')
      .then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body.films).to.be.an('array')
      })
  })

})
