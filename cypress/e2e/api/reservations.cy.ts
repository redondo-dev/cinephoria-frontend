const API = 'http://localhost:3000/api';
const SEANCE_ID = 442;

describe('API Réservations', () => {
  before(() => {
    cy.request({
      method: 'POST',
      url: `${API}/auth/login`,
      body: {
        email: 'test@cinema.fr',
        password: 'password123',
        captchaToken: '10000000-aaaa-bbbb-cccc-000000000001',
      },
    }).then((res) => {
      Cypress.env('token', res.body.token);
    });
  });

  // Helper d'authentification
  const auth = (options: Partial<Cypress.RequestOptions>) => {
    return cy.request({
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${Cypress.env('token')}`,
      },
    } as Cypress.RequestOptions);
  };

  // Récupère un nombre donné de sièges disponibles pour la séance de test
  const getAvailableSeats = (count: number) => {
    return auth({
      method: 'GET',
      url: `${API}/public/reservations/seances/${SEANCE_ID}/sieges`,
    }).then((res) => {
      expect(res.status).to.eq(200);

      const siegesLibres = res.body.sieges.filter(
        (siege: any) => siege.disponible,
      );

      expect(
        siegesLibres.length,
        `au moins ${count} siège(s) disponible(s) pour la séance ${SEANCE_ID}`,
      ).to.be.at.least(count);

      return siegesLibres.slice(0, count).map((siege: any) => siege.id);
    });
  };

  describe('POST /api/reservations', () => {
    it('crée une réservation valide', () => {
      getAvailableSeats(2).then((sieges) => {
        auth({
          method: 'POST',
          url: `${API}/reservations`,
          body: {
            seance_id: SEANCE_ID,
            nb_places: 2,
            prix_unitaire: 9.9,
            sieges,
            statut_reservation: 'en_attente',
          },
        }).then((res) => {
          expect(res.status).to.eq(201);
          expect(res.body).to.have.property('id');
          expect(res.body).to.have.property('statut_reservation', 'en_attente');
          expect(res.body).to.have.property('seance_id', SEANCE_ID);

          // Nettoyage
          auth({
            method: 'DELETE',
            url: `${API}/reservations/${res.body.id}`,
          }).then((deleteRes) => {
            expect(deleteRes.status).to.eq(200);
          });
        });
      });
    });

    it('échoue sans seance_id', () => {
      auth({
        method: 'POST',
        url: `${API}/reservations`,
        failOnStatusCode: false,
        body: {
          nb_places: 2,
          prix_unitaire: 9.9,
        },
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.include('seance_id');
      });
    });

    it('échoue sans nb_places', () => {
      auth({
        method: 'POST',
        url: `${API}/reservations`,
        failOnStatusCode: false,
        body: {
          seance_id: SEANCE_ID,
          prix_unitaire: 9.9,
        },
      }).then((res) => {
        expect(res.status).to.eq(400);
      });
    });

    it('échoue sans prix_unitaire', () => {
      auth({
        method: 'POST',
        url: `${API}/reservations`,
        failOnStatusCode: false,
        body: {
          seance_id: SEANCE_ID,
          nb_places: 2,
        },
      }).then((res) => {
        expect(res.status).to.eq(400);
      });
    });
  });

  describe('GET /api/reservations', () => {
    it('retourne la liste des réservations', () => {
      auth({
        method: 'GET',
        url: `${API}/reservations`,
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an('array');
      });
    });

    it('retourne une réservation par ID avec jointures', () => {
      auth({
        method: 'GET',
        url: `${API}/reservations`,
      }).then((res) => {
        const id = res.body[0]?.id;

        if (!id) {
          return;
        }

        auth({
          method: 'GET',
          url: `${API}/reservations/${id}`,
        }).then((detail) => {
          expect(detail.status).to.eq(200);
          expect(detail.body).to.have.property('id', id);
          expect(detail.body).to.have.property('seance');
          expect(detail.body.seance).to.have.property('film');
          expect(detail.body.seance.film).to.have.property('titre');
        });
      });
    });

    it('retourne 404 pour un ID inexistant', () => {
      auth({
        method: 'GET',
        url: `${API}/reservations/999999`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(404);
      });
    });
  });

  describe('PUT /api/reservations/:id', () => {
    it("met à jour le statut d'une réservation", () => {
      getAvailableSeats(1).then((sieges) => {
        auth({
          method: 'POST',
          url: `${API}/reservations`,
          body: {
            seance_id: SEANCE_ID,
            nb_places: 1,
            prix_unitaire: 9.9,
            sieges,
            statut_reservation: 'en_attente',
          },
        }).then((created) => {
          expect(created.status).to.eq(201);

          const id = created.body.id;

          auth({
            method: 'PUT',
            url: `${API}/reservations/${id}`,
            body: {
              statut_reservation: 'confirmee',
            },
          })
            .then((update) => {
              expect(update.status).to.eq(200);
              expect(update.body).to.have.property(
                'statut_reservation',
                'confirmee',
              );
            })
            .then(() => {
              // Nettoyage après la mise à jour
              auth({
                method: 'DELETE',
                url: `${API}/reservations/${id}`,
              }).then((deleteRes) => {
                expect(deleteRes.status).to.eq(200);
              });
            });
        });
      });
    });

    it('retourne 404 pour un ID inexistant', () => {
      auth({
        method: 'PUT',
        url: `${API}/reservations/999999`,
        failOnStatusCode: false,
        body: {
          statut_reservation: 'confirmee',
        },
      }).then((res) => {
        expect(res.status).to.eq(404);
      });
    });
  });

  describe('DELETE /api/reservations/:id', () => {
    it('supprime une réservation et vérifie 404 ensuite', () => {
      getAvailableSeats(1).then((sieges) => {
        auth({
          method: 'POST',
          url: `${API}/reservations`,
          body: {
            seance_id: SEANCE_ID,
            nb_places: 1,
            prix_unitaire: 9.9,
            sieges,
            statut_reservation: 'en_attente',
          },
        }).then((created) => {
          expect(created.status).to.eq(201);

          const id = created.body.id;

          auth({
            method: 'DELETE',
            url: `${API}/reservations/${id}`,
          })
            .then((deleted) => {
              expect(deleted.status).to.eq(200);
              expect(deleted.body.message).to.include('supprimée');
            })
            .then(() => {
              auth({
                method: 'GET',
                url: `${API}/reservations/${id}`,
                failOnStatusCode: false,
              }).then((check) => {
                expect(check.status).to.eq(404);
              });
            });
        });
      });
    });

    it('retourne 404 pour un ID inexistant', () => {
      auth({
        method: 'DELETE',
        url: `${API}/reservations/999999`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(404);
      });
    });
  });
});
