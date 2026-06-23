// cypress/e2e/api/auth.cy.js
describe('API Auth', () => {
  it('POST /login retourne un token valide', () => {
    cy.request('POST', 'http://localhost:3000/api/auth/login', {
      email: 'test@cinema.fr',
      password: 'password123',
      captchaToken: '10000000-aaaa-bbbb-cccc-000000000001',
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('token');
    });
  });

  it('POST /login avec mauvais mdp retourne 401', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/auth/login',
      body: {
        email: 'test@cinema.fr',
        password: 'faux',
        captchaToken: '10000000-aaaa-bbbb-cccc-000000000001',
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });
});
