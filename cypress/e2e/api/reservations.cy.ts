const API = 'http://localhost:3000/api';
// Seance de reference creee par le seeder (reference.seeder.js, id 15) : elle existe en local comme en CI.
// Modifiable avec --env SEANCE_ID=...
const SEANCE_ID = Number(Cypress.env('SEANCE_ID')) || 15;
const CAPTCHA_TEST = '10000000-aaaa-bbbb-cccc-000000000001';

// Deux comptes de test :
//  - un CLIENT (test@cinema.fr) : il fait les reservations et ne doit pas pouvoir toucher a celles des autres ;
//  - un compte du PERSONNEL (employe) : il lit la liste, modifie le statut et nettoie les reservations de test.
// Les deux comptes sont crees par le seeder de test (backend/src/seeders/test.seeder.js, npm run seed:test)
// dans la base de TEST uniquement, jamais en production. Les identifiants du personnel peuvent etre
// changes avec les variables Cypress STAFF_EMAIL et STAFF_PASSWORD.
const CLIENT = { email: 'test@cinema.fr', password: 'password123' };
const STAFF = {
  email: Cypress.env('STAFF_EMAIL') || 'employe@cinema.fr',
  password: Cypress.env('STAFF_PASSWORD') || 'password123',
};

describe('API Réservations', () => {
  const login = (compte: { email: string; password: string }, cle: string) =>
    cy
      .request({
        method: 'POST',
        url: `${API}/auth/login`,
        body: { ...compte, captchaToken: CAPTCHA_TEST },
      })
      .then((res) => {
        Cypress.env(cle, res.body.token);
      });

  before(() => {
    login(CLIENT, 'tokenClient');
    login(STAFF, 'tokenStaff');
  });

  // Requete authentifiee avec le jeton de l'un des deux comptes
  const requeteAvec =
    (cle: string) => (options: Partial<Cypress.RequestOptions>) =>
      cy.request({
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${Cypress.env(cle)}`,
        },
      } as Cypress.RequestOptions);

  const asClient = requeteAvec('tokenClient');
  const asStaff = requeteAvec('tokenStaff');

  // Identifiant de l'utilisateur, lu dans la charge utile du jeton
  const idDuJeton = (cle: string): number =>
    JSON.parse(atob(Cypress.env(cle).split('.')[1])).id;

  // Récupère un nombre donné de sièges disponibles pour la séance de test
  const getAvailableSeats = (count: number) => {
    return asClient({
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

  // Crée une réservation de test (en attente) avec le compte demandé
  const creerReservation = (
    nbPlaces: number,
    comme: typeof asClient = asClient,
    extra: Record<string, unknown> = {},
  ) =>
    getAvailableSeats(nbPlaces).then((sieges) =>
      comme({
        method: 'POST',
        url: `${API}/reservations`,
        body: {
          seance_id: SEANCE_ID,
          nb_places: nbPlaces,
          prix_unitaire: 9.9,
          sieges,
          statut_reservation: 'en_attente',
          ...extra,
        },
      }),
    );

  // Nettoyage : seul le personnel peut supprimer une réservation (libère les sièges)
  const nettoyer = (id: number) =>
    asStaff({
      method: 'DELETE',
      url: `${API}/reservations/${id}`,
    }).then((deleteRes) => {
      expect(deleteRes.status).to.eq(200);
    });

  describe('POST /api/reservations', () => {
    it('crée une réservation valide', () => {
      creerReservation(2).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('statut_reservation', 'en_attente');
        expect(res.body).to.have.property('seance_id', SEANCE_ID);

        nettoyer(res.body.id);
      });
    });

    it("rattache la réservation à l'utilisateur du jeton, pas à celui du corps", () => {
      creerReservation(1, asClient, { utilisateur_id: 999999 }).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body).to.have.property(
          'utilisateur_id',
          idDuJeton('tokenClient'),
        );

        nettoyer(res.body.id);
      });
    });

    it('échoue sans seance_id', () => {
      asClient({
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
      asClient({
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
      asClient({
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
    it('refuse la liste complète à un client (403)', () => {
      asClient({
        method: 'GET',
        url: `${API}/reservations`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(403);
      });
    });

    it('retourne la liste des réservations au personnel', () => {
      asStaff({
        method: 'GET',
        url: `${API}/reservations`,
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an('array');
      });
    });

    it('retourne une réservation par ID avec jointures (personnel)', () => {
      asStaff({
        method: 'GET',
        url: `${API}/reservations`,
      }).then((res) => {
        const id = res.body[0]?.id;

        if (!id) {
          return;
        }

        asStaff({
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

    it('un client peut lire sa propre réservation', () => {
      creerReservation(1).then((created) => {
        expect(created.status).to.eq(201);
        const id = created.body.id;

        asClient({
          method: 'GET',
          url: `${API}/reservations/${id}`,
        }).then((detail) => {
          expect(detail.status).to.eq(200);
          expect(detail.body).to.have.property('id', id);
        });

        nettoyer(id);
      });
    });

    it("refuse (403) à un client la réservation d'un autre utilisateur", () => {
      // Réservation créée par le personnel, au nom du compte du personnel
      creerReservation(1, asStaff, {
        utilisateur_id: idDuJeton('tokenStaff'),
      }).then((created) => {
        expect(created.status).to.eq(201);
        const id = created.body.id;

        asClient({
          method: 'GET',
          url: `${API}/reservations/${id}`,
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.eq(403);
        });

        nettoyer(id);
      });
    });

    it('retourne 404 pour un ID inexistant', () => {
      asClient({
        method: 'GET',
        url: `${API}/reservations/999999`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(404);
      });
    });
  });

  describe('PUT /api/reservations/:id', () => {
    it("met à jour le statut d'une réservation (personnel)", () => {
      creerReservation(1).then((created) => {
        expect(created.status).to.eq(201);

        const id = created.body.id;

        asStaff({
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
          .then(() => nettoyer(id));
      });
    });

    it('ne modifie que le statut, pas le prix', () => {
      creerReservation(1).then((created) => {
        const id = created.body.id;

        asStaff({
          method: 'PUT',
          url: `${API}/reservations/${id}`,
          body: {
            statut_reservation: 'annulee',
            prix_unitaire: 0.01,
          },
        })
          .then((update) => {
            expect(update.status).to.eq(200);
            expect(Number(update.body.prix_unitaire)).to.eq(9.9);
          })
          .then(() => nettoyer(id));
      });
    });

    it('refuse (403) à un client de modifier une réservation', () => {
      creerReservation(1).then((created) => {
        const id = created.body.id;

        asClient({
          method: 'PUT',
          url: `${API}/reservations/${id}`,
          failOnStatusCode: false,
          body: {
            statut_reservation: 'confirmee',
          },
        })
          .then((res) => {
            expect(res.status).to.eq(403);
          })
          .then(() =>
            // Le statut n'a pas changé : le client ne peut pas se confirmer lui-même une réservation
            asStaff({ method: 'GET', url: `${API}/reservations/${id}` }),
          )
          .then((detail) => {
            expect(detail.body).to.have.property(
              'statut_reservation',
              'en_attente',
            );
          })
          .then(() => nettoyer(id));
      });
    });

    it('retourne 404 pour un ID inexistant', () => {
      asStaff({
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
    it('supprime une réservation (personnel) et vérifie 404 ensuite', () => {
      creerReservation(1).then((created) => {
        expect(created.status).to.eq(201);

        const id = created.body.id;

        asStaff({
          method: 'DELETE',
          url: `${API}/reservations/${id}`,
        })
          .then((deleted) => {
            expect(deleted.status).to.eq(200);
            expect(deleted.body.message).to.include('supprimée');
          })
          .then(() => {
            asStaff({
              method: 'GET',
              url: `${API}/reservations/${id}`,
              failOnStatusCode: false,
            }).then((check) => {
              expect(check.status).to.eq(404);
            });
          });
      });
    });

    it('refuse (403) à un client de supprimer une réservation', () => {
      creerReservation(1).then((created) => {
        const id = created.body.id;

        asClient({
          method: 'DELETE',
          url: `${API}/reservations/${id}`,
          failOnStatusCode: false,
        })
          .then((res) => {
            expect(res.status).to.eq(403);
          })
          .then(() => nettoyer(id));
      });
    });

    it('retourne 404 pour un ID inexistant', () => {
      asStaff({
        method: 'DELETE',
        url: `${API}/reservations/999999`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(404);
      });
    });
  });
});
