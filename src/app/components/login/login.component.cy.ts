import { LoginComponent } from './login.component'
import { mount } from 'cypress/angular'
import { provideRouter } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { AuthService } from '../../core/services/auth.service'
import { Component, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'app-captcha',
  standalone: true,
  template: '<div data-cy="captcha-mock">CAPTCHA mock</div>'
})
class MockCaptchaComponent {
  @Output() tokenChange = new EventEmitter<string>()
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  template: '<div data-cy="forgot-password-mock"></div>'
})
class MockForgotPasswordComponent {
  @Output() close = new EventEmitter<void>()
}

describe('LoginComponent', () => {

  beforeEach(() => {
    // cy.stub() ICI, à l'intérieur de beforeEach → correct
    const mockAuthService = {
      login: cy.stub().as('loginStub'),
      isLoggedIn: () => false,
    }

    mount(LoginComponent, {
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MockCaptchaComponent,
        MockForgotPasswordComponent,
      ],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
  })

  it('affiche le formulaire de connexion', () => {
    cy.get('form').should('exist')
    cy.get('#email').should('exist')
    cy.get('#password').should('exist')
    cy.get('button[type="submit"]').should('exist')
  })

  it('le bouton submit est désactivé si formulaire vide', () => {
    cy.get('button.btn-login').should('be.disabled')
  })

  it('affiche une erreur si email invalide', () => {
    cy.get('#email').type('pasunmail')
    cy.get('#email').blur()
    cy.get('.error-message').should('be.visible')
  })

  it('bouton désactivé sans email', () => {
    cy.get('#password').type('password123')
    cy.get('input[formControlName="rgpdConsent"]').check()
    cy.get('button.btn-login').should('be.disabled')
  })

  it('bouton désactivé sans RGPD', () => {
    cy.get('#email').type('test@cinema.fr')
    cy.get('#password').type('password123')
    cy.get('button.btn-login').should('be.disabled')
  })

  it('bouton désactivé sans mot de passe', () => {
    cy.get('#email').type('test@cinema.fr')
    cy.get('input[formControlName="rgpdConsent"]').check()
    cy.get('button.btn-login').should('be.disabled')
  })

  it('affiche le lien mot de passe oublié', () => {
    cy.get('button.forgot-link').should('contain.text', 'Mot de passe oublié')
  })

  it('affiche le composant forgot-password au clic', () => {
    cy.get('button.forgot-link').click()
    cy.get('[data-cy="forgot-password-mock"]').should('exist')
  })

})
