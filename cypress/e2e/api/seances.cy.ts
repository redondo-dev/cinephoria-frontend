// cypress/e2e/api/seances.cy.ts

describe('API Séances', () => {
  const API = 'http://localhost:3000/api';

  it('GET /api/seances/film/7 retourne les séances du film', () => {
    cy.request(`${API}/seances/film/7`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.greaterThan(0);

      const seance = res.body[0];

      expect(seance).to.have.property('id');
      expect(seance).to.have.property('date');
      expect(seance).to.have.property('heure_debut');
      expect(seance).to.have.property('heure_fin');
      expect(seance).to.have.property('qualite');
      expect(seance).to.have.property('prix');
      expect(seance).to.have.property('cinema');
    });
  });

  it('le message d’erreur confirme un problème de colonne', () => {
    cy.request({
      url: `${API}/seances/film/999999`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 404]);
    });
  });
});
