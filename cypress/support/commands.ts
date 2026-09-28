// /// <reference types="cypress" />

// // ***********************************************
// // Commandes custom Cinéphoria
// // ***********************************************

// Cypress.Commands.add('login', (email: string, password: string) => {
//   cy.visit('/auth/login');
//   cy.get('[data-cy="email-input"]').clear().type(email);
//   cy.get('[data-cy="password-input"]').clear().type(password);
//   cy.get('[data-cy="submit-login"]').click();

//   // Attend la redirection post-login (ajustez '/home' si votre route diffère)
//   cy.url().should('not.include', '/auth/login');
// });

// /**
//  * Visite une URL en injectant token + user dans le localStorage AVANT
//  * le démarrage d'Angular. Nécessaire quand le login a été fait via cy.request()
//  */
// Cypress.Commands.add('visitAsUser', (url: string, token: string, user: any) => {
//   cy.visit(url, {
//     onBeforeLoad(win) {
//       win.localStorage.setItem('token', token);
//       win.localStorage.setItem('user', JSON.stringify(user));
//     },
//   });
// });

// /**
//  * Remplit le formulaire de carte Stripe (Stripe Elements = iframe).
//  * Utilise la carte de test standard Stripe (paiement toujours accepté).
//  */
// Cypress.Commands.add('remplirCarteStripeTest', () => {
//   cy.get('#stripe-card-element iframe', { timeout: 20000 })
//     .should(($iframe) => {
//       expect(
//         $iframe.contents().find('input[name="cardnumber"]'),
//       ).to.have.length.greaterThan(0);
//     })
//     .then(($iframe) => {
//       const body = $iframe.contents().find('body');
//       cy.wrap(body)
//         .find('input[name="cardnumber"]')
//         .type('4242424242424242', { force: true });
//       cy.wrap(body)
//         .find('input[name="exp-date"]')
//         .type('1230', { force: true });
//       cy.wrap(body).find('input[name="cvc"]').type('123', { force: true });
//     });
// });

// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>;
//       visitAsUser(url: string, token: string, user: any): Chainable<void>;
//       remplirCarteStripeTest(): Chainable<void>;
//     }
//   }
// }

// export {};
/// <reference types="cypress" />

// ***********************************************
// Commandes custom Cinéphoria
// ***********************************************

/**
 * Connecte un utilisateur via le formulaire de login réel (pas d'appel API direct)
 * — on veut tester le vrai parcours, tokens/cookies posés par l'app elle-même.
 */
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth/login');
  cy.get('[data-cy="email-input"]').clear().type(email);
  cy.get('[data-cy="password-input"]').clear().type(password);
  cy.get('[data-cy="submit-login"]').click();
  cy.url().should('not.include', '/auth/login');
});

/**
 * Visite une URL en injectant token + user dans le localStorage AVANT
 * le démarrage d'Angular.
 */
Cypress.Commands.add('visitAsUser', (url: string, token: string, user: any) => {
  cy.visit(url, {
    onBeforeLoad(win) {
      win.localStorage.setItem('token', token);
      win.localStorage.setItem('user', JSON.stringify(user));
    },
  });
});

/**
 * Remplit le formulaire de carte Stripe (Stripe Elements = iframe).
 * Utilise la carte de test standard Stripe (paiement toujours accepté).
 *
 * ⚠️ Stripe déclenche parfois un challenge anti-bot (hCaptcha interne, Radar)
 * en environnement automatisé, ce qui peut remonter l'iframe et faire perdre
 * la référence au champ en cours de saisie. On ajoute un délai de stabilisation
 * avant de chercher l'iframe, puis on revérifie après coup que les valeurs
 * saisies sont bien restées en place — en resaisissant si besoin.
 */
Cypress.Commands.add('remplirCarteStripeTest', () => {
  // Laisse le temps aux scripts de fraude Stripe/hCaptcha de se stabiliser
  cy.wait(1500);

  const remplir = () => {
    cy.get('#stripe-card-element iframe', { timeout: 30000 })
      .should(($iframe) => {
        expect($iframe.contents().find('input[name="cardnumber"]')).to.have.length.greaterThan(0);
      })
      .then(($iframe) => {
        const body = $iframe.contents().find('body');
        cy.wrap(body).find('input[name="cardnumber"]').clear({ force: true }).type('4242424242424242', { force: true });
        cy.wrap(body).find('input[name="exp-date"]').clear({ force: true }).type('1230', { force: true });
        cy.wrap(body).find('input[name="cvc"]').clear({ force: true }).type('123', { force: true });
      });
  };

  remplir();

  // Re-vérifie après coup que les valeurs sont bien restées en place.
  // Si Stripe a remonté l'iframe entre-temps, le champ sera vide : on resaisit une fois.
  cy.get('#stripe-card-element iframe', { timeout: 10000 }).then(($iframe) => {
    const val = $iframe.contents().find('input[name="cardnumber"]').val() as string;
    if (!val || !val.includes('4242')) {
      cy.log('⚠️ Carte perdue après remontage iframe Stripe — nouvelle saisie');
      remplir();
    }
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      visitAsUser(url: string, token: string, user: any): Chainable<void>;
      remplirCarteStripeTest(): Chainable<void>;
    }
  }
}

export {};
