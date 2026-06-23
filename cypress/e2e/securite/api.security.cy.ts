// cypress/e2e/securite/api.security.cy.ts

describe('Sécurité API — Tests approfondis', () => {
  const API = () => Cypress.env('API');

  let validToken: string;

  before(() => {
    cy.request({
      method: 'POST',
      url: `${API()}/auth/login`,
      body: {
        email: 'test@cinema.fr',
        password: 'password123',
        captchaToken: '10000000-aaaa-bbbb-cccc-000000000001',
      },
    }).then((res) => {
      validToken = res.body.token;

      // optionnel (évite Cypress.env pour state critique)
      Cypress.env('token', res.body.token);
    });
  });

  // ─── HEADERS DE SÉCURITÉ ──────────────────────────────
  describe('Headers de sécurité HTTP', () => {
    it('retourne les headers de sécurité sur /api/films', () => {
      cy.request(`${API()}/films`).then((res) => {
        expect(res.headers).to.have.property(
          'x-content-type-options',
          'nosniff',
        );
        expect(res.headers).to.have.property('x-frame-options', 'SAMEORIGIN');
        expect(res.headers).to.have.property('x-xss-protection', '0');
        expect(res.headers).to.have.property('strict-transport-security');
      });
    });

    it('retourne les headers CORS corrects', () => {
      cy.request(`${API()}/films`).then((res) => {
        expect(res.headers).to.have.property(
          'access-control-allow-credentials',
          'true',
        );
      });
    });
  });

  // ─── JWT SECURITY ─────────────────────────────────────
  describe('Sécurité des tokens JWT', () => {
    it('token falsifié retourne 401', () => {
      cy.request({
        method: 'GET',
        url: `${API()}/reservations`,
        failOnStatusCode: false,
        headers: { Authorization: 'Bearer token.falsifie.invalide' },
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });

    it('token expiré retourne 401', () => {
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.expired.token';

      cy.request({
        method: 'GET',
        url: `${API()}/reservations`,
        failOnStatusCode: false,
        headers: { Authorization: `Bearer ${expiredToken}` },
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });

    it('sans token retourne 401', () => {
      cy.request({
        method: 'GET',
        url: `${API()}/reservations`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.message).to.include('Token');
      });
    });

    it('token valide donne accès', () => {
      cy.request({
        method: 'GET',
        url: `${API()}/reservations`,
        headers: { Authorization: `Bearer ${validToken}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
      });
    });
  });

  // ─── CSRF ─────────────────────────────────────────────
  describe('Protection CSRF', () => {
    it('requête POST sans token JWT est rejetée', () => {
      cy.request({
        method: 'POST',
        url: `${API()}/reservations`,
        failOnStatusCode: false,
        headers: {
          Origin: 'https://site-malveillant.com',
          Referer: 'https://site-malveillant.com',
          'Content-Type': 'application/json',
        },
        body: {
          seance_id: 15,
          nb_places: 2,
          prix_unitaire: 9.9,
        },
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });

    it('requête POST avec JWT est acceptée', () => {
      cy.request({
        method: 'POST',
        url: `${API()}/reservations`,
        failOnStatusCode: false,
        headers: {
          Origin: 'https://site-malveillant.com',
          Authorization: `Bearer ${validToken}`,
          'Content-Type': 'application/json',
        },
        body: {
          seance_id: 15,
          nb_places: 1,
          prix_unitaire: 9.9,
        },
      }).then((res) => {
        expect(res.status).to.not.eq(401);
        expect(res.status).to.not.eq(403);
      });
    });

    it('CORS bloque origines non autorisées', () => {
      cy.request({
        method: 'OPTIONS',
        url: `${API()}/reservations`,
        failOnStatusCode: false,
        headers: {
          Origin: 'https://attaquant.com',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      }).then((res) => {
        const allowed = res.headers['access-control-allow-origin'];
        if (allowed) {
          expect(allowed).to.not.eq('https://attaquant.com');
        }
      });
    });

    it('DELETE sans token est rejeté', () => {
      cy.request({
        method: 'DELETE',
        url: `${API()}/reservations/1`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });
  });

  // ─── INJECTION SQL ────────────────────────────────────
  describe('Protection contre les injections SQL', () => {
    it('SQL injection email', () => {
      cy.request({
        method: 'POST',
        url: `${API()}/auth/login`,
        failOnStatusCode: false,
        body: {
          email: "' OR '1'='1",
          password: 'password123',
          captchaToken: '10000000-aaaa-bbbb-cccc-000000000001',
        },
      }).then((res) => {
        expect(res.status).to.not.eq(500);
      });
    });
  });

  // ─── XSS ──────────────────────────────────────────────
  describe('Protection contre XSS', () => {
    it('payload XSS login', () => {
      cy.request({
        method: 'POST',
        url: `${API()}/auth/login`,
        failOnStatusCode: false,
        body: {
          email: '<script>alert(1)</script>@test.fr',
          password: 'password123',
          captchaToken: '10000000-aaaa-bbbb-cccc-000000000001',
        },
      }).then((res) => {
        expect(res.status).to.be.oneOf([400, 401]);
      });
    });
  });

  // ─── VALIDATION INPUTS ───────────────────────────────
  describe('Validation inputs', () => {
    it('email invalide', () => {
      cy.request({
        method: 'POST',
        url: `${API()}/auth/login`,
        failOnStatusCode: false,
        body: {
          email: 'invalid',
          password: 'password123',
          captchaToken: 'xxx',
        },
      }).then((res) => {
        expect(res.status).to.be.oneOf([400, 401]);
      });
    });
  });

  // ─── ISOLATION DONNÉES ───────────────────────────────
  describe('Isolation données', () => {
    it('réservation inexistante', () => {
      cy.request({
        method: 'GET',
        url: `${API()}/reservations/999999`,
        failOnStatusCode: false,
        headers: { Authorization: `Bearer ${validToken}` },
      }).then((res) => {
        expect(res.status).to.eq(404);
      });
    });
  });
});
