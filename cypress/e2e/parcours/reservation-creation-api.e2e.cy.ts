// cypress/e2e/parcours/reservation-creation-api.e2e.cy.ts

const API = 'http://localhost:3000/api';

const TEST_USER = {
  email: 'test@cinema.fr',
  password: 'password123',
  captchaToken: '10000000-aaaa-bbbb-cccc-000000000001',
};

const SEANCE_ID = 15;

describe('API - Création de réservation confirmée et génération des billets', () => {
  it('une réservation confirmée crée des billets au statut valide', () => {
    let token: string;
    let userId: number;
    let reservationId: number;

    // ---- 1. Login ----
    cy.request({
      method: 'POST',
      url: `${API}/auth/login`,
      body: TEST_USER,
    }).then((res) => {
      token = res.body.token;
      userId = res.body.user.id;

      // ---- 2. Récupérer un siège disponible pour cette séance ----
      cy.request({
        method: 'GET',
        url: `${API}/public/reservations/seances/${SEANCE_ID}/sieges`,
      }).then((siegesRes) => {
        expect(siegesRes.status).to.eq(200);

        const siegeDisponible = siegesRes.body.sieges.find(
          (s: any) => s.disponible,
        );
        expect(siegeDisponible, 'au moins un siège disponible pour ce test').to
          .exist;

        // ---- 3. Créer la réservation directement, comme le fait stripe-payment.component.ts
        //          après confirmation du paiement (statut_reservation: 'confirmee') ----
        cy.request({
          method: 'POST',
          url: `${API}/reservations`,
          headers: { Authorization: `Bearer ${token}` },
          body: {
            utilisateur_id: userId,
            seance_id: SEANCE_ID,
            nb_places: 1,
            prix_unitaire: 9,
            sieges: [siegeDisponible.id],
            statut_reservation: 'confirmee',
          },
        }).then((createRes) => {
          expect(createRes.status).to.eq(201);
          reservationId = createRes.body.id;
          expect(reservationId, 'id de réservation retourné').to.be.a('number');
          expect(createRes.body.statut_reservation).to.eq('confirmee');

          // ---- 4. Vérifier que les billets associés sont bien 'valide' ----
          cy.request({
            method: 'GET',
            url: `${API}/reservations/${reservationId}`,
            headers: { Authorization: `Bearer ${token}` },
          }).then((getRes) => {
            expect(getRes.status).to.eq(200);
            expect(getRes.body.statut_reservation).to.eq('confirmee');
            expect(
              getRes.body.billets,
              'billets inclus dans la réponse',
            ).to.have.length.greaterThan(0);

            getRes.body.billets.forEach((billet: any) => {
              expect(
                billet.statut_billet,
                `billet ${billet.id} doit être valide`,
              ).to.eq('valide');
            });
          });
        });
      });
    });
  });

  it('une réservation en_attente crée des billets au statut en_attente', () => {
    let token: string;
    let userId: number;

    cy.request({
      method: 'POST',
      url: `${API}/auth/login`,
      body: TEST_USER,
    }).then((res) => {
      token = res.body.token;
      userId = res.body.user.id;

      cy.request({
        method: 'GET',
        url: `${API}/public/reservations/seances/${SEANCE_ID}/sieges`,
      }).then((siegesRes) => {
        // Prendre un autre siège disponible que le précédent test
        const siegesLibres = siegesRes.body.sieges.filter(
          (s: any) => s.disponible,
        );
        expect(
          siegesLibres.length,
          'au moins un siège disponible',
        ).to.be.greaterThan(0);
        const siege = siegesLibres[0];

        cy.request({
          method: 'POST',
          url: `${API}/reservations`,
          headers: { Authorization: `Bearer ${token}` },
          body: {
            utilisateur_id: userId,
            seance_id: SEANCE_ID,
            nb_places: 1,
            prix_unitaire: 9,
            sieges: [siege.id],
            statut_reservation: 'en_attente',
          },
        }).then((createRes) => {
          expect(createRes.status).to.eq(201);
          const reservationId = createRes.body.id;

          cy.request({
            method: 'GET',
            url: `${API}/reservations/${reservationId}`,
            headers: { Authorization: `Bearer ${token}` },
          }).then((getRes) => {
            expect(getRes.status).to.eq(200);
            getRes.body.billets.forEach((billet: any) => {
              expect(billet.statut_billet).to.eq('en_attente');
            });
          });
        });
      });
    });
  });
});

export {};
