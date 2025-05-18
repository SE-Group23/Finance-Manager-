// @ts-nocheck

describe('Dashboard Test Case 09', () => {

  it('T09 - Test Dashboard Access without Login', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
  
    cy.visit('/dashboard');
  
    cy.url().should('eq', 'https://finance-manager-xi-taupe.vercel.app/login');
  
  });
  
});

describe('Dashboard Test Case TC06', () => {
  beforeEach(() => {
    cy.login();
  });

  it('TC06 - Should display net worth, budget progress, expense summary, and transaction history', () => {

    cy.visit('/dashboard');
    cy.contains('Dashboard').should('exist');


    cy.contains('Net Worth').should('exist');
    cy.contains('Credit').should('exist');
    cy.contains('Debit').should('exist');
    cy.contains(/^PKR\s[\d,]+$/).should('exist'); 

    cy.contains('Total Budget Spent').should('exist');
    cy.contains('Monthly Expense Summary').should('exist');

    cy.contains('Transaction History').should('exist');
    cy.contains('View full Transaction History').should('exist');


    cy.contains('Budget by Category').should('exist');
    cy.contains('View full Budget Details').should('exist');
  });

});

