// cypress/e2e/securite/routes.security.cy.ts

const setLocalStorage = (token: string, user: object) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

const clearLocalStorage = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQ3LCJlbWFpbCI6InRlc3RAY2luZW1hLmZyIiwicm9sZSI6IkNMSUVOVCIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.fake'

describe('Sécurité des routes Angular — Guards', () => {

  // ─── AUTH GUARD ───────────────────────────────────────────
  describe('AuthGuard — routes protégées sans connexion', () => {

    beforeEach(() => {
      clearLocalStorage()
    })

    it('redirige vers /auth/login si accès /mon-espace sans token', () => {
      cy.visit('/mon-espace')
      cy.url().should('include', '/auth/login')
    })

    it('redirige vers /auth/login si accès /reservation/payment sans token', () => {
      cy.visit('/reservation/payment')
      cy.url().should('include', '/auth/login')
    })

    it('redirige vers /auth/login si accès /change-password sans token', () => {
      cy.visit('/change-password')
      cy.url().should('include', '/auth/login')
    })

    it('redirige vers /auth/login si accès /intranet sans token', () => {
      cy.visit('/intranet')
      cy.url().should('include', '/auth/login')
    })

    it('redirige vers /auth/login si accès /admin sans token', () => {
      cy.visit('/admin')
      cy.url().should('include', '/auth/login')
    })

  })

  // ─── ROUTES PUBLIQUES ─────────────────────────────────────
  describe('Routes publiques — accessibles sans connexion', () => {

    beforeEach(() => {
      clearLocalStorage()
    })

    it('/home est accessible sans token', () => {
      cy.visit('/home')
      cy.url().should('include', '/home')
    })

    it('/films est accessible sans token', () => {
      cy.visit('/films')
      cy.url().should('include', '/films')
    })

    it('/auth/login est accessible sans token', () => {
      cy.visit('/auth/login')
      cy.url().should('include', '/auth/login')
    })

    it('/auth/register est accessible sans token', () => {
      cy.visit('/auth/register')
      cy.url().should('include', '/auth/register')
    })

    it('/politique-de-confidentialite est accessible sans token', () => {
      cy.visit('/politique-de-confidentialite')
      cy.url().should('include', '/politique-de-confidentialite')
    })

    it('/contact est accessible sans token', () => {
      cy.visit('/contact')
      cy.url().should('include', '/contact')
    })

  })

  // ─── ROLE GUARD CLIENT ────────────────────────────────────
  describe('RoleGuard — CLIENT ne peut pas accéder aux routes ADMIN/EMPLOYE', () => {

    beforeEach(() => {
      clearLocalStorage()
      cy.visit('/home')
      cy.window().then((win) => {
        win.localStorage.setItem('token', fakeToken)
        win.localStorage.setItem('user', JSON.stringify({
          id: 147,
          email: 'test@cinema.fr',
          prenom: 'Test',
          nom: 'User',
          role: 'CLIENT',
          name: 'Test User'
        }))
      })
    })

    it('CLIENT redirigé vers /home si accès /admin', () => {
      cy.visit('/admin')
      cy.url().should('include', '/home')
        .and('not.include', '/admin')
    })

    it('CLIENT redirigé si accès /intranet', () => {
      cy.visit('/intranet')
      cy.url().should('not.include', '/intranet')
    })

    it('CLIENT peut accéder à /mon-espace', () => {
      cy.visit('/mon-espace')
      cy.url().should('include', '/mon-espace')
    })

    it('CLIENT peut accéder à /films', () => {
      cy.visit('/films')
      cy.url().should('include', '/films')
    })

  })

  // ─── ROLE GUARD ADMIN ─────────────────────────────────────
  describe('RoleGuard — ADMIN peut accéder à toutes les routes protégées', () => {

    beforeEach(() => {
      clearLocalStorage()
      cy.visit('/home')
      cy.window().then((win) => {
        win.localStorage.setItem('token', fakeToken)
        win.localStorage.setItem('user', JSON.stringify({
          id: 1,
          email: 'admin@cinema.fr',
          prenom: 'Admin',
          nom: 'Cinephoria',
          role: 'ADMIN',
          name: 'Admin Cinephoria'
        }))
      })
    })

    it('ADMIN peut accéder à /admin', () => {
      cy.visit('/admin')
      cy.url().should('include', '/admin')
    })

    it('ADMIN peut accéder à /intranet', () => {
      cy.visit('/intranet')
      cy.url().should('include', '/intranet')
    })

  })

  // ─── ROLE GUARD EMPLOYE ───────────────────────────────────
  describe('RoleGuard — EMPLOYE peut accéder à /intranet mais pas /admin', () => {

    beforeEach(() => {
      clearLocalStorage()
      cy.visit('/home')
      cy.window().then((win) => {
        win.localStorage.setItem('token', fakeToken)
        win.localStorage.setItem('user', JSON.stringify({
          id: 50,
          email: 'employe@cinema.fr',
          prenom: 'Jean',
          nom: 'Dupont',
          role: 'EMPLOYE',
          name: 'Jean Dupont'
        }))
      })
    })

    it('EMPLOYE peut accéder à /intranet', () => {
      cy.visit('/intranet')
      cy.url().should('include', '/intranet')
    })

    it('EMPLOYE redirigé vers /home si accès /admin', () => {
      cy.visit('/admin')
      cy.url().should('include', '/home')
        .and('not.include', '/admin')
    })

  })

  // ─── LOGOUT ───────────────────────────────────────────────
  describe('Logout — nettoyage du localStorage', () => {

    it('après logout les routes protégées redirigent vers login', () => {
      // Setup — simule un user connecté
      cy.visit('/home')
      cy.window().then((win) => {
        win.localStorage.setItem('token', fakeToken)
        win.localStorage.setItem('user', JSON.stringify({
          id: 147,
          email: 'test@cinema.fr',
          role: 'CLIENT',
          prenom: 'Test',
          nom: 'User',
          name: 'Test User'
        }))
      })

      // Vérifie accès avant logout
      cy.visit('/mon-espace')
      cy.url().should('include', '/mon-espace')

      // Logout — vide le localStorage
      cy.window().then((win) => {
        win.localStorage.removeItem('token')
        win.localStorage.removeItem('user')
      })

      // Vérifie redirection après logout
      cy.visit('/mon-espace')
      cy.url().should('include', '/auth/login')
    })

  })

})
